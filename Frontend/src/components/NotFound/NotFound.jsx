import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <section className='page notfound'>
    <div className="content">
      <img src="/notfound.png" alt="notfound" className='nfimg' />
      <Link to={'/'}>RETURN TO HOME PAGE</Link>
    </div>
  </section>
  )
}

export default NotFound

