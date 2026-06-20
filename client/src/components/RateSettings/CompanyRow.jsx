import { TrashIcon } from "../ui/Icons";
import CompanyProcessCell from "./CompanyProcessCell";

const PROCESS_KEYS = [
    "normalColor",
    "metallicColor",
    "mattFinish",
    "singleLamination",
    "doubleLamination",
    "slitting",
];

export default function CompanyRow({
    company,
    onUpdate,
    onDelete,
    canEdit,
    archived,
}) {
    const handleProcessChange = (processKey, price, isAvailable) => {
        const numPrice = Number(price);
        onUpdate(company.id, processKey, numPrice, isAvailable);
    };

    return (
        <tr className={archived ? "opacity-50" : ""}>
            <td className="px-3 py-2 text-xs text-label-3 text-center">
                {archived ? "📦" : ""}
            </td>
            <td className="px-3 py-2 text-sm font-medium text-label">
                {company.name}
            </td>

            {PROCESS_KEYS.map((processKey) => (
                <CompanyProcessCell
                    key={processKey}
                    processKey={processKey}
                    process={company.processes[processKey]}
                    onUpdate={(price, isAvailable) =>
                        handleProcessChange(processKey, price, isAvailable)
                    }
                    canEdit={canEdit && !archived}
                />
            ))}

            <td className="px-3 py-2 text-center">
                {canEdit && !archived && (
                    <button
                        type="button"
                        onClick={() => onDelete(company.id, company.name)}
                        className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                        title="Archive company"
                    >
                        <TrashIcon className="size-4" />
                    </button>
                )}
            </td>
        </tr>
    );
}
