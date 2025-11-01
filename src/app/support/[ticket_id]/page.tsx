"use client";

import { useContext, useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthContext } from "@/lib/context/auth.context";
import { useWebsiteTicketService } from "@/lib/services/ticket.service";
import TicketDetailHeader from "@/components/support/TicketDetailHeader";
import TicketMessages from "@/components/support/TicketMessages";
import TicketReplyForm from "@/components/support/TicketReplyForm";
import TicketClosedNotice from "@/components/support/TicketClosedNotice";
import { Button } from "@/components/ui/button";
import { SerializedEditorState, ElementFormatType } from "lexical";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Editor } from "@/components/blocks/editor-00/editor";
import { ArrowLeft, MessageSquare, Plus } from "lucide-react";

// Lexical için boş serialized state
const EMPTY_EDITOR_STATE: SerializedEditorState = {
  root: {
    children: [],
    direction: "ltr",
    format: "left" as ElementFormatType,
    indent: 0,
    type: "root",
    version: 1,
  },
};

// Lexical editör serialized state'i boş mu kontrolü
function isEditorStateEmpty(state: SerializedEditorState) {
  if (!state || !state.root || !Array.isArray(state.root.children)) return true;
  return (
    state.root.children.length === 0 ||
    state.root.children.every(
      (child: any) =>
        (child.type === "paragraph" &&
          (!child.children || child.children.length === 0)) ||
        (child.type === "paragraph" &&
          child.children.every(
            (grandchild: any) =>
              grandchild.type === "text" &&
              (!grandchild.text || grandchild.text.trim() === "")
          ))
    )
  );
}

export default function TicketDetailPage() {
  const params = useParams<{ ticket_id: string }>();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { getTicket, replyToTicket, createTicket, getTicketCategories } =
    useWebsiteTicketService();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // State for create form
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState<any>(EMPTY_EDITOR_STATE);
  const [createError, setCreateError] = useState("");

  // Fetch categories for create
  useEffect(() => {
    if (params.ticket_id === "create") {
      setLoading(true);
      getTicketCategories().then((cats) => {
        setCategories(cats);
        setLoading(false);
      });
    }
  }, [params.ticket_id]);

  // Fetch ticket for detail/reply
  const fetchTicket = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTicket({ ticketId: params.ticket_id });
      setTicket(data);
    } catch {
      setTicket(null);
    } finally {
      setLoading(false);
    }
  }, [params.ticket_id]);

  useEffect(() => {
    if (params.ticket_id !== "create") {
      fetchTicket();
    }
  }, [fetchTicket, params.ticket_id]);

  // Handle send for reply
  const handleSend = async (content: SerializedEditorState) => {
    if (!ticket || isEditorStateEmpty(content)) return;
    setSending(true);
    try {
      await replyToTicket({ ticketId: ticket.id, reply: { message: content } });
      await fetchTicket();
    } finally {
      setSending(false);
    }
  };

  // Handle send for create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    if (!categoryId || !title || isEditorStateEmpty(message) || !user) {
      setCreateError("Lütfen tüm alanları doldurun.");
      return;
    }
    setSending(true);
    try {
      const created = await createTicket({
        ticket: { title, categoryId, message },
      });
      router.replace(`/support/${created.id}`);
    } catch (err) {
      setCreateError("Destek talebi oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
            {params.ticket_id === "create"
              ? "Kategori ve alanlar yükleniyor..."
              : "Destek Talebi Yükleniyor..."}
          </p>
        </div>
      </div>
    );
  }

  // CREATE TICKET FORM
  if (params.ticket_id === "create") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => router.push("/support")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>

          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Plus className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Yeni Destek Talebi Oluştur
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Sorununuzu detaylı bir şekilde açıklayın
            </p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="category"
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  Kategori
                </Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  Başlık
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Kısa bir başlık yazın"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  Mesaj
                </Label>
                <Editor
                  onSerializedChange={(val) =>
                    setMessage(val || EMPTY_EDITOR_STATE)
                  }
                />
              </div>

              {createError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-200 text-sm">
                    {createError}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={sending}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Gönder
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // TICKET DETAIL/REPLY
  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 dark:text-red-400 text-6xl mb-4">❌</div>
          <p className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">
            Destek talebi bulunamadı
          </p>
          <Button
            onClick={() => router.push("/support")}
            className="bg-gray-600 hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push("/support")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>

        {/* Content */}
        <div className="space-y-6">
          <TicketDetailHeader ticket={ticket} />
          <TicketMessages
            messages={ticket.messages || []}
            currentUserId={user?.id || ""}
          />
          {ticket.status === "CLOSED" ? (
            <TicketClosedNotice />
          ) : (
            <TicketReplyForm
              onSend={handleSend}
              loading={sending}
              initialValue={EMPTY_EDITOR_STATE}
            />
          )}
        </div>
      </div>
    </div>
  );
}
