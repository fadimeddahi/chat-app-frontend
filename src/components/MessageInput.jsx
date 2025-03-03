import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage, selectedUser } = useChatStore();
  const { user: authUser } = useAuthStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let tempId; // Declare tempId here
    
    try {
      if (!message.trim() && !imagePreview) {
        toast.error("Message cannot be empty");
        return;
      }

      if (!selectedUser?._id) {
        toast.error("No conversation selected");
        return;
      }

      tempId = Date.now().toString();
      const tempMessage = {
        _id: tempId,
        senderId: {
          _id: authUser._id,
          profilePicture: authUser.profilePicture
        },
        receiverId: selectedUser._id,
        message: message.trim(),
        image: imagePreview,
        createdAt: new Date()
      };

      // Optimistic update
      useChatStore.getState().sendMessage(tempMessage);

      // Real submission
      await sendMessage({
        message: message.trim(),
        image: imagePreview
      });

      setMessage("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (error) {
      // Rollback using tempId
      if (tempId) {
        useChatStore.setState(state => ({
          messages: state.messages.filter(msg => msg._id !== tempId)
        }));
      }
      toast.error(error.message || "Failed to send message");
    }
  };

  return (
    <div className="p-4 border-t border-base-200 bg-base-100">
      {imagePreview && (
        <div className="relative mb-3 w-fit">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-24 h-24 object-cover rounded-lg border"
          />
          <button
            onClick={() => setImagePreview(null)}
            className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-ghost"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 w-full">
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="input input-bordered w-full pr-16"
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <Image className="size-5" />
            </button>
            
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-circle"
          disabled={!message.trim() && !imagePreview}
        >
          <Send className="size-5" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;