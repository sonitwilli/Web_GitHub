import { GetServerSideProps } from 'next'

const TaiKhoanIdPage = () => null

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params || {}
  const raw = Array.isArray(id) ? id[0] : id ?? ''
  // normalize known typo: replace any occurrence of "quan-li" with "quan-ly" (case-insensitive)
  const tab = String(raw).replace(/quan-li/gi, 'quan-ly')
  const destination = `/tai-khoan${tab ? `?tab=${encodeURIComponent(tab)}` : ''}`

  return {
    redirect: {
      destination,
      permanent: false,
    },
  }
}

export default TaiKhoanIdPage
