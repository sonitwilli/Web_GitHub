export type PackageItem = {
  name: string;
  content: string;
  fee: {
    text: string;
    details: string;
  };
};

export type Policies = {
  title: string;
  columns: string[][];
};

export type TelcoConfig = {
  id: string;
  title: string;
  showControls: boolean;
};

export type DichVuData = {
  iconData: { src: string; text: string }[];
  logoBrand: { src: string; alt: string; width: number; height: number }[];
  packages: Record<string, PackageItem[]>;
  policies: Policies;
  telcos: {
    [key: string]: TelcoConfig;
  };
};