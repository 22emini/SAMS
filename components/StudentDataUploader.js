"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

export default function StudentDataUploader() {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const downloadTemplate = () => {
    const headers = ["name", "grade", "address", "contact", "email"]
    const csvContent = [
      headers.join(","),
      "John Doe,C.S,Winslow,09123456789,john.doe@example.com",
      "Jane Smith,S.E,456 Oak Ave,09987654321,jane.smith@example.com",
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "student_template.csv"
    a.click()
    window.URL.revokeObjectURL(url) // Clean up to avoid memory leaks
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        setLoading(true)
        const text = e.target.result
        const rows = text.split("\n").map((row) => row.split(","))
        const headers = rows[0]
        const students = rows
          .slice(1)
          .map((row) => {
            return {
              name: row[0]?.trim() || "",
              grade: row[1]?.trim() || "",
              address: row[2]?.trim() || "",
              contact: row[3]?.trim() || "",
              email: row[4]?.trim() || "",
            }
          })
          .filter((student) => student.name && student.grade)

        const response = await fetch("/api/student/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ students }),
        })

        if (response.status === 401) {
          toast.error("Please sign in to upload student data")
          // Redirect to sign in page or handle authentication
          return
        }

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Upload failed")
        }

        toast.success(`Successfully uploaded ${data.count} student records!`)
        router.refresh() // Refresh the page to show new data
        setOpen(false)
      } catch (error) {
        toast.error("Error uploading students: " + error.message)
      } finally {
        setLoading(false)
        event.target.value = "" // Reset the file input
      }
    }
    reader.readAsText(file)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-blue-700 hover:bg-blue-600">
        <Upload className="mr-2 h-4 w-4" />
        Upload Student Data
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Student Data</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button onClick={downloadTemplate} className="bg-blue-700 hover:bg-blue-600">
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label htmlFor="file-upload" className="text-sm font-medium">
                CSV File
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={loading}
                className="border p-2 rounded text-sm file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0 file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {loading && (
              <div className="flex items-center justify-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-700 border-t-transparent"></div>
                <span className="ml-2">Uploading...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}