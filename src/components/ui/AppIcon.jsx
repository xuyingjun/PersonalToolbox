const ICON_PATHS = {
  AlertCircle: [
    'M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    'M12 15.75h.008v.008H12v-.008Z',
  ],
  ArrowDown: ['m19.5 8.25-7.5 7.5-7.5-7.5'],
  ArrowLeft: ['M15.75 19.5 8.25 12l7.5-7.5'],
  ArrowUp: ['m4.5 15.75 7.5-7.5 7.5 7.5'],
  CalendarPlus: [
    'M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M5.25 4.5h13.5A1.5 1.5 0 0 1 20.25 6v13.5A1.5 1.5 0 0 1 18.75 21H5.25a1.5 1.5 0 0 1-1.5-1.5V6a1.5 1.5 0 0 1 1.5-1.5Z',
    'M12 11.25v6M9 14.25h6',
  ],
  Check: ['m4.5 12.75 4.5 4.5 10.5-10.5'],
  ChevronRight: ['m8.25 4.5 7.5 7.5-7.5 7.5'],
  Close: ['M6 18 18 6M6 6l12 12'],
  DatabaseBackup: [
    'M4.5 6c0 1.243 3.358 2.25 7.5 2.25S19.5 7.243 19.5 6 16.142 3.75 12 3.75 4.5 4.757 4.5 6Z',
    'M4.5 6v4.5c0 1.243 3.358 2.25 7.5 2.25.933 0 1.827-.051 2.65-.146M4.5 10.5V15c0 1.243 3.358 2.25 7.5 2.25',
    'M17.25 14.25v3.75m0 0-1.875-1.875M17.25 18l1.875-1.875M14.25 20.25a5.25 5.25 0 1 0 0-7.5',
  ],
  Download: ['M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4.5 19.5h15'],
  GripVertical: [
    'M9.75 6.75h.008v.008H9.75V6.75Z',
    'M9.75 11.25h.008v.008H9.75v-.008Z',
    'M9.75 15.75h.008v.008H9.75V15.75Z',
    'M14.25 6.75h.008v.008H14.25V6.75Z',
    'M14.25 11.25h.008v.008H14.25v-.008Z',
    'M14.25 15.75h.008v.008H14.25V15.75Z',
  ],
  History: [
    'M3 12a9 9 0 1 0 3-6.708M3 4.5v4.875h4.875',
    'M12 7.5V12l3 1.5',
  ],
  Home: ['m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75'],
  Info: [
    'M11.25 11.25 12 10.5l.75.75M12 10.5v5.25',
    'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    'M12 7.5h.008v.008H12V7.5Z',
  ],
  ListChecks: [
    'm3.75 6 1.5 1.5 2.25-3M3.75 12l1.5 1.5 2.25-3M3.75 18l1.5 1.5 2.25-3',
    'M10.5 6h9.75M10.5 12h9.75M10.5 18h9.75',
  ],
  Loader: ['M12 3a9 9 0 1 1-9 9'],
  Pencil: ['m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z', 'M19.5 7.125 16.875 4.5'],
  Bell: ['M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022 23.848 23.848 0 0 0 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0'],
  Plus: ['M12 4.5v15m7.5-7.5h-15'],
  Refresh: ['M16.023 9.348h4.992V4.356M2.985 19.644v-4.992h4.992', 'M4.582 9.75a7.5 7.5 0 0 1 12.823-3.405l3.61 3.003M2.985 14.652l3.61 3.003A7.5 7.5 0 0 0 19.418 14.25'],
  Search: ['m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z'],
  SearchCheck: ['m15.75 15.75 2.25 2.25 3.75-4.5', 'm14.25 14.25-.628.628m0 0a6.375 6.375 0 1 1-9.016-9.016 6.375 6.375 0 0 1 9.016 9.016Z'],
  Tags: [
    'M9.568 3.057A1.5 1.5 0 0 1 10.63 2.62h7.5a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-.44 1.06l-7.5 7.5a1.5 1.5 0 0 1-2.12 0l-5.75-5.75a1.5 1.5 0 0 1 0-2.12l5.75-7.5Z',
    'M15.75 6.75h.008v.008h-.008V6.75Z',
  ],
  Trash: ['M14.74 9 14.394 18m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166M19.228 5.79 18.16 19.673A2.25 2.25 0 0 1 15.916 21H8.084a2.25 2.25 0 0 1-2.244-2.327L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-11 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m6.5 0V4.477c0-1.18-.91-2.173-2.084-2.21a51.964 51.964 0 0 0-3.332 0C9.16 2.304 8.25 3.296 8.25 4.477v.916m7.5 0a48.667 48.667 0 0 0-7.5 0'],
  Upload: ['M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5M4.5 19.5h15'],
  User: ['M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z'],
}

export default function AppIcon({ name, size = 24, strokeWidth = 1.8, className, ...props }) {
  const paths = ICON_PATHS[name] ?? ICON_PATHS.Info

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {paths.map((path, index) => <path d={path} key={index} />)}
    </svg>
  )
}

function icon(name) {
  return function NamedAppIcon(props) {
    return <AppIcon name={name} {...props} />
  }
}

export const AlertCircle = icon('AlertCircle')
export const ArrowDown = icon('ArrowDown')
export const ArrowLeft = icon('ArrowLeft')
export const ArrowUp = icon('ArrowUp')
export const Bell = icon('Bell')
export const CalendarPlus = icon('CalendarPlus')
export const Check = icon('Check')
export const ChevronRight = icon('ChevronRight')
export const DatabaseBackup = icon('DatabaseBackup')
export const Download = icon('Download')
export const GripVertical = icon('GripVertical')
export const History = icon('History')
export const Home = icon('Home')
export const Info = icon('Info')
export const LayoutList = icon('ListChecks')
export const ListChecks = icon('ListChecks')
export const LoaderCircle = icon('Loader')
export const Pencil = icon('Pencil')
export const Plus = icon('Plus')
export const RefreshCw = icon('Refresh')
export const RotateCcw = icon('Refresh')
export const Search = icon('Search')
export const SearchCheck = icon('SearchCheck')
export const Tags = icon('Tags')
export const Trash2 = icon('Trash')
export const Upload = icon('Upload')
export const UserRound = icon('User')
export const X = icon('Close')
