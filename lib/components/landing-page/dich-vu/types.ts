export type PackageDetails =
  | string
  | {
      head: string;
      data: string;
      tail: string;
    };

export type PackageItem = {
  name: string;
  description: string;
  details: PackageDetails;
  syntax: string;
  syntax2: string;
  syntax3?: string;
  fee: {
    text: string;
    details: string;
  };
};

export type Labels = {
  dataFee: string;
  registerSyntax: string;
  cancelSyntax: string;
  checkData: string;
  registerButtonPrefix: string;
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
  // packages contains per-telco arrays plus a 'labels' object.
  // Use a union value so keys may be either PackageItem[] or Labels.
  packages: Record<string, PackageItem[] | Labels>;
  policies: Policies;
  telcos: {
    [key: string]: TelcoConfig;
  };
};
