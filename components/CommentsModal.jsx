import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Send, Loader } from "lucide-react";

export default function CommentsModal({ isOpen, onClose, comments = [], onAddComment, isLoading }) {
	const [newComment, setNewComment] = useState("");

	const handleAddComment = async () => {
		if (!newComment.trim()) return;
		await onAddComment(newComment);
		setNewComment("");
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleAddComment();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
				<DialogHeader className="p-4">
					<DialogTitle className="flex items-center gap-2">
						<span>Comentarios</span>
						<span className="text-sm text-gray-500">({comments?.length || 0})</span>
					</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col h-full bg-gray-200 relative">
					<div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar absolute inset-0 bottom-[72px]">
						<div className="flex flex-col gap-3">
							{comments?.map((comment) => (
								<div
									key={comment.id}
									className={cn(
										"flex flex-col p-2 rounded-lg",
										"bg-gray-300",
										comment.author === "SYSTEM" && "bg-gray-300",
										comment.author === "SDR" && "bg-indigo-200",
										comment.author === "CLIENT" && "bg-green-200",
										comment.author === "MANAGER" && "bg-orange-200"
									)}
								>
									<div className="flex gap-1 items-center">
										<p className="font-semibold text-xs">{comment.author}</p>
										<p className="text-[10px] text-gray-500">
											{formatDistanceToNow(new Date(comment.createdAt), {
												addSuffix: true,
												locale: es,
											})}
										</p>
									</div>
									<p className="text-xs">{comment.text}</p>
								</div>
							))}
						</div>
					</div>
					<div className="flex gap-2 w-full px-4 py-4 bg-white border-t border-gray-300 absolute bottom-0">
						<Input
							placeholder="Escribe un comentario"
							value={newComment}
							size="sm"
							onChange={(e) => setNewComment(e.target.value)}
							onKeyDown={handleKeyDown}
							className="flex-1"
						/>
						<button
							onClick={handleAddComment}
							disabled={isLoading || !newComment.trim()}
							className="aspect-square p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
						>
							{isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
						</button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
