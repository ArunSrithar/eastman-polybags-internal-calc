export default function TableShell({ title, action, columns, children }) {
  return (
    <div className="overflow-hidden">
      {title ? (
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-base font-semibold text-label">{title}</p>
          {action ? action : null}
        </div>
      ) : null}
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
