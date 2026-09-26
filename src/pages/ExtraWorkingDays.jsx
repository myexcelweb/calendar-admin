import DayListPage from "../components/DayListPage";

export default function ExtraWorkingDays() {
  return (
    <DayListPage
      field="extraWorkingDays"
      eyebrow="Working calendar override"
      title="Extra working days"
      description={
        <>
          Stored as calendars/{"{year}"}/months/{"{month}"}.extraWorkingDays — days that
          are normally off (usually weekends) but declared working.
        </>
      }
      listLabel="Extra working days"
      emptyText="No extra working days set for this month yet."
    />
  );
}
