'use client';

export default function AnimatedTrashButton({ onClick, title = 'Hapus', className = '', large = false }) {
  return (
    <button
      onClick={onClick}
      className={`delete-button ${large ? 'delete-button-lg' : ''} ${className}`}
      title={title}
      aria-label={title}
    >
      <svg className="trash-svg" viewBox="0 -10 64 74" xmlns="http://www.w3.org/2000/svg">
        <g id="trash-can">
          <rect x={16} y={24} width={32} height={30} rx={3} ry={3} fill="#e74c3c" />
          <g transformOrigin="12 18" id="lid-group">
            <rect x={12} y={12} width={40} height={6} rx={2} ry={2} fill="#c0392b" />
            <rect x={26} y={8} width={12} height={4} rx={2} ry={2} fill="#c0392b" />
          </g>
        </g>
      </svg>
    </button>
  );
}
