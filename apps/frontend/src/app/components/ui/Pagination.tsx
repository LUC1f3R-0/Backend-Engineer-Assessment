import React from 'react'

const Pagination = () => {
  return (
    <>
  <div className="col-span-12 mx-auto mt-12 grid grid-cols-4 grid-rows-2 items-center gap-3 px-4 py-4 pb-8 sm:flex sm:justify-center">
    <div className="wt-button-font order-2 col-span-2 flex justify-end gap-2"><a
        className="rounded-lg flex items-center gap-2 border border-transparent px-3 py-1 transition duration-150 ease-in-out hover:border-wt-primary"
        href="/?page=1"
        style={{color: "rgb(3, 7, 18)", border: "1px solid rgb(229, 231, 235)", backgroundColor: "rgb(249, 250, 251)"}}>First</a>
        <a className="rounded-lg flex items-center gap-2 border border-transparent px-3 py-1 transition duration-150 ease-in-out hover:border-wt-primary"
        href="/?page=2"
        style={{color: "rgb(3, 7, 18)", border: "1px solid rgb(229, 231, 235)", backgroundColor: "rgb(249, 250, 251)"}}><svg
        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
          aria-hidden="true" data-slot="icon" className="rotate-180 transform" height="16px">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
        </svg>Back</a></div>
    <div className="order-1 col-span-4 flex justify-center gap-3 sm:order-2"><a
        className="rounded-lg flex items-center gap-2 border border-transparent px-3 py-1 transition duration-150 ease-in-out hover:border-wt-primary"
        href="/?page=1"
        style={{color: "rgb(3, 7, 18)", border: "1px solid rgb(229, 231, 235)", backgroundColor: "rgb(249, 250, 251)"}}>1</a><a
        className="rounded-lg flex items-center gap-2 border border-transparent px-3 py-1 transition duration-150 ease-in-out hover:border-wt-primary"
        href="/?page=2"
        style={{color: "rgb(3, 7, 18)", border: "1px solid rgb(229, 231, 235)", backgroundColor: "rgb(249, 250, 251)"}}>2</a><a
        className="rounded-lg flex items-center gap-2 border border-transparent px-3 py-1 transition duration-150 ease-in-out hover:border-wt-primary"
        href="/?page=3"
        style={{color: "rgb(255, 255, 255)", border: "1px solid rgb(229, 231, 235)", backgroundColor: "rgb(0, 0, 0)"}}>3</a><a
        className="rounded-lg flex items-center gap-2 border border-transparent px-3 py-1 transition duration-150 ease-in-out hover:border-wt-primary"
        href="/?page=4"
        style={{color: "rgb(3, 7, 18)", border: "1px solid rgb(229, 231, 235)", backgroundColor: "rgb(249, 250, 251)"}}>4</a><a
        className="rounded-lg flex items-center gap-2 border border-transparent px-3 py-1 transition duration-150 ease-in-out hover:border-wt-primary"
        href="/?page=5"
        style={{color: "rgb(3, 7, 18)", border: "1px solid rgb(229, 231, 235)", backgroundColor: "rgb(249, 250, 251)"}}>5</a><a
        className="rounded-lg flex items-center gap-2 border border-transparent px-3 py-1 transition duration-150 ease-in-out hover:border-wt-primary"
        href="/?page=6"
        style={{color: "rgb(3, 7, 18)", border: "1px solid rgb(229, 231, 235)", backgroundColor: "rgb(249, 250, 251)"}}>6</a><a
        className="rounded-lg flex items-center gap-2 border border-transparent px-3 py-1 transition duration-150 ease-in-out hover:border-wt-primary"
        href="/?page=7"
        style={{
          color: "rgb(3, 7, 18)",
          border: "1px solid rgb(229, 231, 235)",
          backgroundColor: "rgb(249, 250, 251)"
        }}>7</a><a
        className="rounded-lg flex items-center gap-2 border border-transparent px-3 py-1 transition duration-150 ease-in-out hover:border-wt-primary"
        href="/?page=8"
        style={{
          color: "rgb(3, 7, 18)",
          border: "1px solid rgb(229, 231, 235)",
          backgroundColor: "rgb(249, 250, 251)"
        }}>8</a>
    </div>
    <div className="wt-button-font order-2 col-span-2 flex items-center gap-2"><a
        className="rounded-lg flex items-center gap-2 border border-transparent px-3 py-1 transition duration-150 ease-in-out hover:border-wt-primary"
        href="/?page=4"
        style={{
          color: "rgb(3, 7, 18)",
          border: "1px solid rgb(229, 231, 235)",
          backgroundColor: "rgb(249, 250, 251)"
        }}>Next
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
          aria-hidden="true" data-slot="icon" height="16px">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
        </svg></a><a
        className="rounded-lg flex items-center gap-2 border border-transparent px-3 py-1 transition duration-150 ease-in-out hover:border-wt-primary"
        href="/?page=12"
        style={{
          color: "rgb(3, 7, 18)",
          border: "1px solid rgb(229, 231, 235)",
          backgroundColor: "rgb(249, 250, 251)"
        }}>Last</a>
    </div>
  </div>
        </>
  )
}

export default Pagination