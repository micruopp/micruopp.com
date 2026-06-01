import { parseISO, format, isValid } from 'date-fns';

export default function Date({ dateString }: { dateString: string }) {
    if (!dateString) return <time dateTime="">—</time>;
    const date = parseISO(dateString);
    if (!isValid(date)) return <time dateTime={dateString}>{dateString}</time>;
    return <time dateTime={dateString}>{format(date, 'LLLL d, yyyy')}</time>;
}
