import { useEffect, useRef, useCallback } from "react";
import { Line } from "fabric";

const SNAP_THRESHOLD = 8;
const GUIDE_COLOR = "#ff4757";

interface SnapGuide {
  horizontal: Line | null;
  vertical: Line | null;
  centerH: Line | null;
  centerV: Line | null;
}

export const useSnapGuides = (fabricCanvas: any) => {
  const guidesRef = useRef<SnapGuide>({
    horizontal: null,
    vertical: null,
    centerH: null,
    centerV: null,
  });

  const clearGuides = useCallback(() => {
    const guides = guidesRef.current;
    Object.values(guides).forEach((guide) => {
      if (guide && fabricCanvas) {
        fabricCanvas.remove(guide);
      }
    });
    guidesRef.current = {
      horizontal: null,
      vertical: null,
      centerH: null,
      centerV: null,
    };
  }, [fabricCanvas]);

  const createGuideLine = useCallback(
    (x1: number, y1: number, x2: number, y2: number) => {
      return new Line([x1, y1, x2, y2], {
        stroke: GUIDE_COLOR,
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        excludeFromExport: true,
      });
    },
    []
  );

  const showSnapGuides = useCallback(
    (movingObject: any) => {
      if (!fabricCanvas) return;

      clearGuides();

      const canvasWidth = fabricCanvas.width || 800;
      const canvasHeight = fabricCanvas.height || 600;

      const objLeft = movingObject.left || 0;
      const objTop = movingObject.top || 0;
      const objWidth = (movingObject.width || 0) * (movingObject.scaleX || 1);
      const objHeight = (movingObject.height || 0) * (movingObject.scaleY || 1);

      const objCenterX = objLeft + objWidth / 2;
      const objCenterY = objTop + objHeight / 2;
      const objRight = objLeft + objWidth;
      const objBottom = objTop + objHeight;

      const canvasCenterX = canvasWidth / 2;
      const canvasCenterY = canvasHeight / 2;

      // Check canvas center alignment (vertical guide for horizontal centering)
      if (Math.abs(objCenterX - canvasCenterX) < SNAP_THRESHOLD) {
        movingObject.set({ left: canvasCenterX - objWidth / 2 });
        const guide = createGuideLine(canvasCenterX, 0, canvasCenterX, canvasHeight);
        fabricCanvas.add(guide);
        guidesRef.current.centerV = guide;
      }

      // Check canvas center alignment (horizontal guide for vertical centering)
      if (Math.abs(objCenterY - canvasCenterY) < SNAP_THRESHOLD) {
        movingObject.set({ top: canvasCenterY - objHeight / 2 });
        const guide = createGuideLine(0, canvasCenterY, canvasWidth, canvasCenterY);
        fabricCanvas.add(guide);
        guidesRef.current.centerH = guide;
      }

      // Check edge alignments
      // Left edge to canvas
      if (Math.abs(objLeft) < SNAP_THRESHOLD) {
        movingObject.set({ left: 0 });
      }
      // Right edge to canvas
      if (Math.abs(objRight - canvasWidth) < SNAP_THRESHOLD) {
        movingObject.set({ left: canvasWidth - objWidth });
      }
      // Top edge to canvas
      if (Math.abs(objTop) < SNAP_THRESHOLD) {
        movingObject.set({ top: 0 });
      }
      // Bottom edge to canvas
      if (Math.abs(objBottom - canvasHeight) < SNAP_THRESHOLD) {
        movingObject.set({ top: canvasHeight - objHeight });
      }

      // Check alignment with other objects
      const objects = fabricCanvas.getObjects().filter((obj: any) => {
        return (
          obj !== movingObject &&
          !guidesRef.current.horizontal &&
          !guidesRef.current.vertical &&
          obj.selectable !== false
        );
      });

      for (const obj of objects) {
        const targetLeft = obj.left || 0;
        const targetTop = obj.top || 0;
        const targetWidth = (obj.width || 0) * (obj.scaleX || 1);
        const targetHeight = (obj.height || 0) * (obj.scaleY || 1);
        const targetCenterX = targetLeft + targetWidth / 2;
        const targetCenterY = targetTop + targetHeight / 2;
        const targetRight = targetLeft + targetWidth;
        const targetBottom = targetTop + targetHeight;

        // Horizontal alignment checks
        if (Math.abs(objTop - targetTop) < SNAP_THRESHOLD) {
          movingObject.set({ top: targetTop });
          if (!guidesRef.current.horizontal) {
            const guide = createGuideLine(0, targetTop, canvasWidth, targetTop);
            fabricCanvas.add(guide);
            guidesRef.current.horizontal = guide;
          }
        } else if (Math.abs(objBottom - targetBottom) < SNAP_THRESHOLD) {
          movingObject.set({ top: targetBottom - objHeight });
          if (!guidesRef.current.horizontal) {
            const guide = createGuideLine(0, targetBottom, canvasWidth, targetBottom);
            fabricCanvas.add(guide);
            guidesRef.current.horizontal = guide;
          }
        } else if (Math.abs(objCenterY - targetCenterY) < SNAP_THRESHOLD) {
          movingObject.set({ top: targetCenterY - objHeight / 2 });
          if (!guidesRef.current.horizontal) {
            const guide = createGuideLine(0, targetCenterY, canvasWidth, targetCenterY);
            fabricCanvas.add(guide);
            guidesRef.current.horizontal = guide;
          }
        }

        // Vertical alignment checks
        if (Math.abs(objLeft - targetLeft) < SNAP_THRESHOLD) {
          movingObject.set({ left: targetLeft });
          if (!guidesRef.current.vertical) {
            const guide = createGuideLine(targetLeft, 0, targetLeft, canvasHeight);
            fabricCanvas.add(guide);
            guidesRef.current.vertical = guide;
          }
        } else if (Math.abs(objRight - targetRight) < SNAP_THRESHOLD) {
          movingObject.set({ left: targetRight - objWidth });
          if (!guidesRef.current.vertical) {
            const guide = createGuideLine(targetRight, 0, targetRight, canvasHeight);
            fabricCanvas.add(guide);
            guidesRef.current.vertical = guide;
          }
        } else if (Math.abs(objCenterX - targetCenterX) < SNAP_THRESHOLD) {
          movingObject.set({ left: targetCenterX - objWidth / 2 });
          if (!guidesRef.current.vertical) {
            const guide = createGuideLine(targetCenterX, 0, targetCenterX, canvasHeight);
            fabricCanvas.add(guide);
            guidesRef.current.vertical = guide;
          }
        }
      }
    },
    [fabricCanvas, clearGuides, createGuideLine]
  );

  useEffect(() => {
    if (!fabricCanvas) return;

    const onObjectMoving = (e: any) => {
      showSnapGuides(e.target);
    };

    const onObjectModified = () => {
      clearGuides();
      fabricCanvas.renderAll();
    };

    const onSelectionCleared = () => {
      clearGuides();
      fabricCanvas.renderAll();
    };

    fabricCanvas.on("object:moving", onObjectMoving);
    fabricCanvas.on("object:modified", onObjectModified);
    fabricCanvas.on("selection:cleared", onSelectionCleared);
    fabricCanvas.on("mouse:up", clearGuides);

    return () => {
      fabricCanvas.off("object:moving", onObjectMoving);
      fabricCanvas.off("object:modified", onObjectModified);
      fabricCanvas.off("selection:cleared", onSelectionCleared);
      fabricCanvas.off("mouse:up", clearGuides);
    };
  }, [fabricCanvas, showSnapGuides, clearGuides]);

  return { clearGuides };
};
