const RINGS = 22;

export function BookBinding() {
  return (
    <div className="book-binding" aria-hidden="true">
      <div className="book-holes">
        {Array.from({ length: RINGS }, (_, index) => (
          <span key={index} className="book-hole" />
        ))}
      </div>
      <div className="book-coil">
        {Array.from({ length: RINGS }, (_, index) => (
          <span key={index} className="book-coil-ring" />
        ))}
      </div>
    </div>
  );
}
