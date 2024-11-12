declare module 'next-themes' {
  import { ReactNode } from 'react';

  interface ThemeProviderProps {
    children: ReactNode;
    attribute?: string;
    defaultTheme?: string;
    enableSystem?: boolean;
    disableTransitionOnChange?: boolean;
  }

  export function ThemeProvider(props: ThemeProviderProps): JSX.Element;

  interface UseThemeProps {
    theme: string | undefined;
    setTheme: (theme: string) => void;
    systemTheme?: string;
  }

  export function useTheme(): UseThemeProps;
}

declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  export const Moon: FC<SVGProps<SVGSVGElement>>;
  export const Sun: FC<SVGProps<SVGSVGElement>>;
  export const Clock: FC<SVGProps<SVGSVGElement>>;
  export const CheckCircle: FC<SVGProps<SVGSVGElement>>;
  export const AlertCircle: FC<SVGProps<SVGSVGElement>>;
  export const Plus: FC<SVGProps<SVGSVGElement>>;
  export const Pencil: FC<SVGProps<SVGSVGElement>>;
  export const Trash2: FC<SVGProps<SVGSVGElement>>;
  export const CalendarDays: FC<SVGProps<SVGSVGElement>>;
  export const Tag: FC<SVGProps<SVGSVGElement>>;
  export const LayoutDashboard: FC<SVGProps<SVGSVGElement>>;
  export const Calendar: FC<SVGProps<SVGSVGElement>>;
  export const ListTodo: FC<SVGProps<SVGSVGElement>>;
  export const Settings: FC<SVGProps<SVGSVGElement>>;
}

declare module 'mongodb' {
  import { MongoClient as MongoClientType, ObjectId as ObjectIdType } from '@types/mongodb';
  export const MongoClient: typeof MongoClientType;
  export const ObjectId: typeof ObjectIdType;
  export * from '@types/mongodb';
} 