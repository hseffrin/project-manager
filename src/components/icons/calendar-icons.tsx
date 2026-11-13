// Drawn inline (not next/image) so the color comes from the text color:
// className="text-brand-error" turns them red in the form's error state.

type CalendarIconProps = {
  className?: string;
  // Accessible name. Without it the icon is decorative and hidden from screen
  // readers.
  title?: string;
};

function CalendarIcon({
  path,
  className = "",
  title,
}: CalendarIconProps & { path: string }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      {...(title
        ? { role: "img", "aria-label": title }
        : { "aria-hidden": true })}
    >
      <path
        d={path}
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}

const START_PATH =
  "M20.75 3H18.5V0.375C18.5 0.16875 18.3312 0 18.125 0H17.375C17.1687 0 17 0.16875 17 0.375V3H8V0.375C8 0.16875 7.83125 0 7.625 0H6.875C6.66875 0 6.5 0.16875 6.5 0.375V3H4.25C3.00781 3 2 4.00781 2 5.25V21.75C2 22.9922 3.00781 24 4.25 24H20.75C21.9922 24 23 22.9922 23 21.75V5.25C23 4.00781 21.9922 3 20.75 3ZM21.5005 21.75C21.5005 22.1625 21.163 22.5 20.7505 22.5H4.25049C3.83799 22.5 3.50049 22.1625 3.50049 21.75V9H21.5005V21.75ZM3.50049 7.5H21.5005V5.25C21.5005 4.8375 21.163 4.5 20.7505 4.5H4.25049C3.83799 4.5 3.50049 4.8375 3.50049 5.25V7.5ZM7.25146 18H11.7515C12.164 18 12.5015 17.6625 12.5015 17.25V12.75C12.5015 12.3375 12.164 12 11.7515 12H7.25146C6.83896 12 6.50146 12.3375 6.50146 12.75V17.25C6.50146 17.6625 6.83896 18 7.25146 18ZM10.9985 13.5H7.99854V16.5H10.9985V13.5Z";

const END_PATH =
  "M18.5 3H20.75C21.9927 3 23 4.00734 23 5.25V21.75C23 22.9927 21.9927 24 20.75 24H4.25C3.00734 24 2 22.9927 2 21.75V5.25C2 4.00734 3.00734 3 4.25 3H6.5V0.5625C6.5 0.251859 6.75186 0 7.0625 0H7.4375C7.74814 0 8 0.251859 8 0.5625V3H17V0.5625C17 0.251859 17.2519 0 17.5625 0H17.9375C18.2481 0 18.5 0.251859 18.5 0.5625V3ZM20.7505 4.5H4.25049C3.83696 4.5 3.50049 4.83647 3.50049 5.25V7.5H21.5005V5.25C21.5005 4.83647 21.164 4.5 20.7505 4.5ZM20.7505 22.5H4.25049C3.83696 22.5 3.50049 22.1635 3.50049 21.75V9H21.5005V21.75C21.5005 22.1635 21.164 22.5 20.7505 22.5ZM11.3122 19.63L17.6305 13.3623C17.8512 13.1434 17.8527 12.7869 17.6337 12.5662L17.2372 12.1665C17.0182 11.9457 16.6618 11.9443 16.441 12.1633L10.92 17.64L8.55554 15.2688C8.33602 15.0486 7.97958 15.0481 7.75941 15.2676L7.36074 15.6651C7.14062 15.8847 7.1401 16.2411 7.35962 16.4613L10.517 19.6278C10.7362 19.8476 11.0919 19.8485 11.3122 19.63Z";

export function CalendarStartIcon(props: CalendarIconProps) {
  return <CalendarIcon path={START_PATH} {...props} />;
}

export function CalendarEndIcon(props: CalendarIconProps) {
  return <CalendarIcon path={END_PATH} {...props} />;
}
