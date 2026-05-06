import InvoiceEmpty from "../invoice/InvoiceEmpty";

export default function EmptyFormState() {
  return (
    <InvoiceEmpty
      message="No user selected"
      hint="Select a user from the left list to edit details."
    />
  );
}
