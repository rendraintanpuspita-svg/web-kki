import { useRef, useEffect } from "react";

function TrajectoryA({ pointsData = [] }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const container = canvas.parentElement;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();

      const width = rect.width;
      const height = rect.height;

      if (width <= 0 || height <= 0) return;

      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const padding = 35;

      const graphWidth = width - padding;
      const graphHeight = height - padding;

      ctx.clearRect(0, 0, width, height);

      const maxValue = 3100;
      const stepValue = 300;

      const scaleX = graphWidth / maxValue;
      const scaleY = graphHeight / maxValue;


      // =========================
      // GRID
      // =========================

      ctx.strokeStyle = "#555";
      ctx.lineWidth = 1;

      // Vertical
      for (let x = 0; x <= maxValue; x += stepValue) {

        const px = padding + x * scaleX;

        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, graphHeight);
        ctx.stroke();
      }


      // Horizontal
      for (let y = 0; y <= maxValue; y += stepValue) {

        const py = graphHeight - y * scaleY;

        ctx.beginPath();
        ctx.moveTo(padding, py);
        ctx.lineTo(width, py);
        ctx.stroke();
      }


      // =========================
      // SUMBU
      // =========================

      ctx.strokeStyle = "#aaa";
      ctx.lineWidth = 2;

      // X axis
      ctx.beginPath();
      ctx.moveTo(padding, graphHeight);
      ctx.lineTo(width, graphHeight);
      ctx.stroke();

      // Y axis
      ctx.beginPath();
      ctx.moveTo(padding, 0);
      ctx.lineTo(padding, graphHeight);
      ctx.stroke();


      // =========================
      // LABEL X
      // =========================

      ctx.fillStyle = "#aaa";
      ctx.font = "9px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      for (let x = 0; x <= maxValue; x += stepValue) {

        const px = padding + x * scaleX;

        ctx.fillText(
          x,
          px,
          graphHeight + 5
        );
      }


      // =========================
      // LABEL Y
      // =========================

      ctx.textAlign = "right";
      ctx.textBaseline = "middle";

      for (let y = stepValue; y <= maxValue; y += stepValue) {

        const py = graphHeight - y * scaleY;

        ctx.fillText(
          y,
          padding - 5,
          py
        );
      }


      // =========================
      // STATIC POINTS
      // =========================

      const greenPoints = [
        { x: 2650, y: 970 },
        { x: 2530, y: 1300 },
        { x: 2670, y: 1570 },

        { x: 1800, y: 2400 },
        { x: 1630, y: 2400 },
        { x: 1460, y: 2400 },
        { x: 1290, y: 2400 },

        { x: 370, y: 1800 },
        { x: 230, y: 1500 },
        { x: 200, y: 1200 },
      ];


      const redPoints = [
        { x: 2410, y: 970 },
        { x: 2330, y: 1300 },
        { x: 2470, y: 1570 },

        { x: 1800, y: 2200 },
        { x: 1630, y: 2200 },
        { x: 1460, y: 2200 },
        { x: 1290, y: 2200 },

        { x: 570, y: 1800 },
        { x: 430, y: 1500 },
        { x: 400, y: 1200 },
      ];


      const bluePoints = [
        { x: 2470, y: 300 },
        { x: 2470, y: 225 },
        { x: 2470, y: 150 },
      ];


      const drawStatic = (points, color, size) => {

        ctx.fillStyle = color;

        points.forEach((point) => {

          const px = padding + point.x * scaleX;
          const py = graphHeight - point.y * scaleY;

          ctx.beginPath();

          ctx.arc(
            px,
            py,
            size,
            0,
            Math.PI * 2
          );

          ctx.fill();
        });
      };


      drawStatic(greenPoints, "#22c55e", 4);
      drawStatic(redPoints, "#ef4444", 4);
      drawStatic(bluePoints, "#3b82f6", 3);


      // =========================
      // BOX
      // =========================

      const boxes = [
        {
          x: 530,
          y: 620,
          color: "#3b82f6",
          width: 30,
          height: 15,
        },

        {
          x: 830,
          y: 320,
          color: "#22c55e",
          width: 30,
          height: 15,
        },

        {
          x: 2550,
          y: 225,
          color: "#aaa",
          width: 20,
          height: 40,
        },
      ];


      boxes.forEach((box) => {

        const px = padding + box.x * scaleX;
        const py = graphHeight - box.y * scaleY;

        ctx.fillStyle = box.color;

        ctx.fillRect(
          px - box.width / 2,
          py - box.height / 2,
          box.width,
          box.height
        );
      });


      // =========================
      // DYNAMIC TRAJECTORY
      // =========================

      const startX = 2550;
      const startY = 225;

      if (pointsData.length > 0) {

        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 3;

        ctx.beginPath();

        const orderedPoints = [
          ...pointsData,
        ].reverse();


        orderedPoints.forEach((point, index) => {

          const drawX = startX + point.x;
          const drawY = startY + point.y;

          const xPixel =
            padding + drawX * scaleX;

          const yPixel =
            graphHeight - drawY * scaleY;


          if (index === 0) {

            ctx.moveTo(
              xPixel,
              yPixel
            );

          } else {

            ctx.lineTo(
              xPixel,
              yPixel
            );

          }

        });

        ctx.stroke();
      }
    };


    resizeCanvas();

    const observer = new ResizeObserver(
      resizeCanvas
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };

  }, [pointsData]);


  return (
    <div className="h-full w-full">

      <canvas
        ref={canvasRef}
        className="block h-full w-full"
      />

    </div>
  );
}

export default TrajectoryA;