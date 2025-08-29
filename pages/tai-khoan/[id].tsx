import { GetServerSideProps } from 'next'

const TaiKhoanIdPage = () => null

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params || {}
  const raw = Array.isArray(id) ? id[0] : id ?? ''
  // normalize known typo: replace any occurrence of "quan-li" with "quan-ly" (case-insensitive)
  let tab = raw;
  switch (raw) {
    case 'multi-profiles':
        tab = 'ho-so';
        break
    case 'thong-tin-ca-nhan':
        tab = 'tai-khoan';
        break
    case 'quan-li-thiet-bi':
        tab = 'quan-ly-thiet-bi';
        break
    case 'quan-li-the-thanh-toan':
        tab = 'thanh-toan-va-goi';
        break
    case 'quan-li-gia-han-dich-vu':
        tab = 'quan-ly-gia-han-dich-vu';
        break
    default:
        tab = raw;
  }
  
  const destination = `/tai-khoan${tab ? `?tab=${encodeURIComponent(tab)}` : ''}`

  return {
    redirect: {
      destination,
      permanent: false,
    },
  }
}

export default TaiKhoanIdPage