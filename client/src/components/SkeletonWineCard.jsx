export default function SkeletonWineCard() {
  return (
    <div className="wine-card skeleton-card" aria-hidden="true">
      <div className="wine-card-image">
        <div className="skeleton-img skeleton-pulse"></div>
      </div>
      <div className="wine-card-body">
        <div className="skeleton-line skeleton-pulse" style={{ width: '60%', height: '12px', marginBottom: '10px' }}></div>
        <div className="skeleton-line skeleton-pulse" style={{ width: '85%', height: '16px', marginBottom: '10px' }}></div>
        <div className="skeleton-line skeleton-pulse" style={{ width: '50%', height: '12px', marginBottom: '14px' }}></div>
        <div className="wine-card-divider"></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <div className="skeleton-line skeleton-pulse" style={{ width: '35%', height: '20px' }}></div>
          <div className="skeleton-line skeleton-pulse" style={{ width: '20%', height: '14px' }}></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="wine-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonWineCard key={i} />
      ))}
    </div>
  );
}
