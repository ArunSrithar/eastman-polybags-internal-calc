export default function TableShell({ columns, children }) {
  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th
                  key={col.key}
                  className={`table-header-cell ${i === 0 ? "rounded-l-full" : ""} ${i === columns.length - 1 ? "rounded-r-full" : ""} ${col.className ?? ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-separator">{children}</tbody>
        </table>
      </div>
    </div>
  );
}
