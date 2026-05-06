import InvoiceEmpty from "../invoice/InvoiceEmpty";

export default function EmptyRoleState() {
  return (
    <InvoiceEmpty
      message="No role selected"
      hint="Select a role from the left list to edit permissions."
    />
  );
}
