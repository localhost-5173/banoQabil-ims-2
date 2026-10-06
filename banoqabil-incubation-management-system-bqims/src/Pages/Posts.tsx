import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { postRepo } from "@/repositories/postRepo";
import UrlBreadcrumb from "@/components/UrlBreadcrumb";
import { MdDeleteSweep, MdEditSquare } from "react-icons/md";
import Loader from "@/components/Loader";

interface Post {
  _id: string;
  title: string;
  description: string;
  link: string;
  image: string;
}



const Posts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    image: null as File | null,
    existingImage: "",
  });

  const fetchPosts = async () => {
    try {
      const data = await postRepo.getAllPosts();
      setPosts(data || []);
    } catch {
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      link: "",
      image: null,
      existingImage: "",
    });
    setPreviewImage(null);
    setErrors({});
    setEditingId(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, image: file }));
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("link", formData.link);

      if (formData.image) {
        // Agar nayi image select hui hai
        form.append("image", formData.image);
      } else if (formData.existingImage) {
        // Agar edit mode hai aur user ne new image select nahi ki
        form.append("existingImage", formData.existingImage);
      }

      if (editingId) {
        await postRepo.updatePost(editingId, form); // ab form-data jayega
        toast.success("Post updated successfully");
      } else {
        await postRepo.createPost(form);
        toast.success("Post created successfully");
      }

      setIsModalOpen(false);
      resetForm();
      fetchPosts();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error(error.response?.data?.message || "Action failed");
      }
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await postRepo.deletePost(deleteId);
      setPosts((prev) => prev.filter((p) => p._id !== deleteId));
      toast.success("Post deleted successfully");
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setDeleteId(null);
    }
  };

  const openEditModal = (post: Post) => {
    setFormData({
      title: post.title,
      description: post.description,
      link: post.link,
      image: null,
      existingImage: post.image,
    });
    setPreviewImage(post.image || null);
    setEditingId(post._id);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="p-6">
      <UrlBreadcrumb />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Button onClick={() => setIsModalOpen(true)}>Add Post</Button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post._id}
                className="bg-white dark:bg-neutral-900 shadow rounded-lg overflow-hidden"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-44 w-full object-cover"
                />
                <div className="p-4">
                  <h2 className="text-lg font-semibold">{post.title}</h2>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                    {post.description}
                  </p>
                  {post.link && (
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 text-sm mt-2 inline-block"
                    >
                      Visit Link
                    </a>
                  )}
                  <div className="flex justify-start gap-2 mt-4">
                    <Button
                      variant="default"
                      size="icon"
                      onClick={() => openEditModal(post)}
                      className="cursor-pointer rounded-full"
                    >
                      <MdEditSquare className="text-white" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(post._id)}
                      className="cursor-pointer rounded-full"
                    >
                      <MdDeleteSweep className="text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No posts found</p>
          )}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold mb-3 text-center">{editingId ? "Edit Post" : "Create Post"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-6 mb-6 mt-7">
            {[{ name: "title", label: "Title", type: "text" },
            { name: "link", label: "Link", type: "text" }].map((input) => (
              <div key={input.name} className="relative z-0 w-full group">
                <input
                  type={input.type}
                  name={input.name}
                  id={input.name}
                  value={(formData as any)[input.name]}
                  onChange={handleChange}
                  className={`peer block w-full appearance-none border-0 border-b-2 bg-transparent py-2.5 px-0 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 ${errors[input.name] ? "border-red-500" : "border-gray-300"
                    }`}
                  placeholder=" "
                  autoComplete="off"
                />
                <label
                  htmlFor={input.name}
                  className={`absolute top-3 origin-[0] transform text-gray-500 duration-200 ${(formData as any)[input.name]
                    ? "-translate-y-6 scale-75 text-blue-600"
                    : "peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-600"
                    }`}
                >
                  {input.label}
                </label>
                {errors[input.name] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors[input.name]}
                  </p>
                )}
              </div>
            ))}

            <div className="relative z-0 w-full group">
              <textarea
                name="description"
                id="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className={`peer block w-full appearance-none border-0 border-b-2 bg-transparent py-2.5 px-0 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 ${errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder=" "
              />
              <label
                htmlFor="description"
                className={`absolute top-3 origin-[0] transform text-gray-500 duration-200 ${formData.description
                  ? "-translate-y-6 scale-75 text-blue-600"
                  : "peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-600"
                  }`}
              >
                Description
              </label>
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="h-40 w-full object-cover rounded border"
                />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              className="w-full h-11 text-lg font-medium shadow-sm hover:shadow-md transition"
              onClick={handleSave}
            >
              {editingId ? "Update Post" : "Create Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Yes, Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Posts;
