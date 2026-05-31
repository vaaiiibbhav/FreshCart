"use client"

export default function UnauthorizedPage() {
    return <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Access Denied 🚫 </h1>
      <p className="text-lg">You do not have permission to access this page.</p>
      <button 
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      onClick={()=>window.history.back()}
      >Go Back</button>
    </div>
}