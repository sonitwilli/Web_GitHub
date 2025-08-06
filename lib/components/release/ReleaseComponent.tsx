import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import versionsData from '@/versions.json';
import { FaChevronDown } from 'react-icons/fa';
import styles from './Release.module.css';

interface VersionItem {
  version: string;
  date: string;
  content: string[];
}

const ReleaseComponent = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const [selected, setSelected] = useState<string | null>(null);
  const [version, setVersion] = useState<VersionItem | null>(null);
  const versions: VersionItem[] = versionsData.versions;

  useEffect(() => {
    if (id) {
      const versionStr = id.startsWith('v') ? id.slice(1) : id;
      setSelected(versionStr);
      const found =
        versions.find((item) => item.version === versionStr) || null;
      setVersion(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelected(value);
    router.push(`/release/v${value}`);
  };

  return (
    <div className="text-primary-gray text-[17px] mt-25 f-container">
      <hr className="w-full bg-primary-gray my-6 h-[1px] border-0" />
      <div className="flex flex-col items-end md:flex-row md:justify-center md:items-start md:f-container">
        {/* Left block */}
        <div className="w-[50%] md:w-[18%] 2xl:w-[15%] pr-4 mb-6 lg:mb-0">
          {versions.length > 0 && selected && (
            <div className="relative">
              <select
                id="select"
                value={selected}
                onChange={handleChange}
                className={`${styles.release_scrollbar} appearance-none w-full bg-eerie-black text-white font-bold text-base rounded-xl h-10 pl-3 pr-10 mb-4 border-none outline-none`}
              >
                {versions.map((item, index) => (
                  <option key={index} value={item.version}>
                    {item.version}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute top-[20%] right-4 text-primary-gray">
                <FaChevronDown />
              </div>
            </div>
          )}
          <div className="flex items-center pl-1">
            <svg
              className="w-[17px] h-[17px] text-primary-gray"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {version?.date && <span className="ml-2">{version.date}</span>}
          </div>
        </div>

        {/* Right block */}
        <div className="w-full md:w-[50%] 2xl:w-[45%] md:border-l border-primary-gray pl-4">
          {version?.content && (
            <blockquote>
              <ul className="list-none pl-0 space-y-2">
                {version.content.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </blockquote>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReleaseComponent;
