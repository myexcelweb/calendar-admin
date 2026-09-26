import DayListPage from "../components/DayListPage";

export default function OptionalLeaves() {
  return (
    <DayListPage
      field="optionalLeaveDays"
      eyebrow="Restricted / optional holidays"
      title="Optional leave"
      description={
        <>
          Stored as calendars/{"{year}"}/months/{"{month}"}.optionalLeaveDays — pick a
          month, then add the day numbers.
        </>
      }
      listLabel="Optional leave days"
      emptyText="No optional leave days set yet."
    />
  );
}
