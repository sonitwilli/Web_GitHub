import Link from 'next/link';

const links = [
  {
    title: 'Home',
    link: '/',
  },
  {
    title: 'Blog',
    link: '/blog',
  },
  {
    title: 'MarketingA',
    link: '/a',
  },
  {
    title: 'MarketingB',
    link: '/b',
  },
];

export default function TopNav() {
  return (
    <div className="flex items-center gap-1 f-container">
      {links.map((link, index) => (
        <Link
          href={link.link}
          key={index}
          className="underline"
          prefetch={false}
        >
          {link.title}
        </Link>
      ))}
    </div>
  );
}
