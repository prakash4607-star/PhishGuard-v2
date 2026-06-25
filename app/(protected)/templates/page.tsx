"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../src/lib/supabase";
import { createAuditLog } from "../../../src/lib/audit";
import Sidebar from "../../../src/components/Sidebar";

export default function TemplatesPage() {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    const { data } = await supabase
      .from("templates")
      .select("*")
      .order("id");

    setTemplates(data || []);
  }

  async function createTemplate() {
    const { error } = await supabase
      .from("templates")
      .insert([
        {
          name,
          subject,
          content,
        },
      ]);

    if (!error) {
      await createAuditLog(
        "Template Created",
        name
      );

      setName("");
      setSubject("");
      setContent("");

      fetchTemplates();
    }
  }

  async function deleteTemplate(
    id: number,
    templateName: string
  ) {
    const { error } = await supabase
      .from("templates")
      .delete()
      .eq("id", id);

    if (!error) {
      await createAuditLog(
        "Template Deleted",
        templateName
      );

      fetchTemplates();
    }
  }

  return (
    <main className="min-h-screen bg-[#030B1A] text-white flex">
      <Sidebar />

      <div className="flex-1 p-10">
        <h1 className="text-4xl font-bold mb-8">
          Template Library
        </h1>

        <div className="border p-4 rounded mb-8">
          <input
            placeholder="Template Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="border p-2 mr-2 text-black"
          />

          <input
            placeholder="Email Subject"
            value={subject}
            onChange={(e) =>
              setSubject(e.target.value)
            }
            className="border p-2 mr-2 text-black"
          />

          <textarea
            placeholder="Template Content"
            value={content}
            onChange={(e) =>
              setContent(e.target.value)
            }
            className="border p-2 text-black w-full mt-4 h-40"
          />

          <button
            onClick={createTemplate}
            className="bg-green-600 px-4 py-2 rounded mt-4"
          >
            Save Template
          </button>
        </div>

        <table className="border-collapse border border-gray-500 w-full">
          <thead>
            <tr>
              <th className="border p-2">
                Name
              </th>

              <th className="border p-2">
                Subject
              </th>

              <th className="border p-2">
                Content
              </th>

              <th className="border p-2">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {templates.map((template) => (
              <tr key={template.id}>
                <td className="border p-2">
                  {template.name}
                </td>

                <td className="border p-2">
                  {template.subject}
                </td>

                <td className="border p-2">
                  {template.content}
                </td>

                <td className="border p-2">
                  <button
                    onClick={() =>
                      deleteTemplate(
                        template.id,
                        template.name
                      )
                    }
                    className="bg-red-600 px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}