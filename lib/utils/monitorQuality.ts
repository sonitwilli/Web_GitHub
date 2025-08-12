export type MonitorQualityOption = {
  _id: string;
  name: string;
  label: string;
  manifest_id?: string;
  resolvedUri?: string;
  is_auto_profile?: boolean;
};

export type QualityAllPreference =
  | { name: string; val: string }
  | null
  | undefined;

const normalize = (s?: string | number | null) =>
  (s === undefined || s === null ? '' : String(s)).toLowerCase();

export function pickMonitorQuality(
  qualities: MonitorQualityOption[],
  preference: QualityAllPreference,
): MonitorQualityOption | null {
  if (!preference || !qualities?.length) return null;
  const pref = normalize(preference.val);
  if (!pref) return null;

  if (pref === 'auto') {
    return (
      qualities.find(
        (q) =>
          q.is_auto_profile ||
          normalize(q._id) === 'auto' ||
          normalize(q.manifest_id) === 'auto',
      ) || null
    );
  }

  const target = pref.replace('p', '');
  return (
    qualities.find((q) => {
      const id = normalize(q.manifest_id) || normalize(q._id);
      const label = normalize(q.label) || normalize(q.name);
      return id.includes(target) || label.includes(target);
    }) || null
  );
}
