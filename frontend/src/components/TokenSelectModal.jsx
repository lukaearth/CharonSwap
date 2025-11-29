
export default function TokenSelectModal({ open, onClose, onSelect }) {
    if (!open) return null;
  
    const tokens = [
      { symbol: "CHR", address: "CHR_ADDRESS" },
      { symbol: "FETH", address: "FETH_ADDRESS" },
    ];
  
    return (
      <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
        <div className="bg-black border border-emerald-glow p-6 rounded-xl shadow-neon w-72">
          <h2 className="text-xl mb-4">Select Token</h2>
  
          {tokens.map((t) => (
            <button
              key={t.symbol}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-emerald-dim transition"
              onClick={() => {
                onSelect(t.symbol);
                onClose();
              }}
            >
              {t.symbol}
            </button>
          ))}
  
          <button className="mt-4 text-center w-full text-red-400" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }
  