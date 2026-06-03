import React from 'react';

const Loader = () => {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[60vh] w-full h-full">
      <style>{`
        .my-custom-loader {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .my-custom-bar {
          display: inline-block;
          width: 3px;
          height: 20px;
          background-color: rgba(255, 255, 255, 0.5);
          border-radius: 10px;
          animation: scale-up4 1s linear infinite;
        }

        .my-custom-bar:nth-child(2) {
          height: 35px;
          margin: 0 5px;
          animation-delay: 0.25s;
        }

        .my-custom-bar:nth-child(3) {
          animation-delay: 0.5s;
        }

        @keyframes scale-up4 {
          20% {
            background-color: #E1FF01;
            transform: scaleY(1.5);
          }
          40% {
            transform: scaleY(1);
          }
        }
      `}</style>
      <div className="my-custom-loader">
        <span className="my-custom-bar" />
        <span className="my-custom-bar" />
        <span className="my-custom-bar" />
      </div>
    </div>
  );
};

export default Loader;
