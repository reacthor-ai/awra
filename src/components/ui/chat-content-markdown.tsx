import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export const ChatContentMarkdown = ({content}: {content: string}) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={cn(
        // Base styles
        "text-sm sm:text-base max-w-none",
        "[&>*]:mb-4 last:[&>*]:mb-0",

        // Headings
        "[&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4",
        "[&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mb-3",
        "[&>h3]:text-lg [&>h3]:font-semibold",
        "[&>h4]:text-base [&>h4]:font-semibold",

        // Paragraphs and lists
        "[&>p]:leading-relaxed [&>p]:mb-3",
        "[&>ul]:my-3 [&>ul]:pl-6 [&>ul]:list-disc",
        "[&>ol]:my-3 [&>ol]:pl-6 [&>ol]:list-decimal",
        "[&>li]:my-1 [&>li]:pl-2",

        // Horizontal rules
        "[&>hr]:my-4 [&>hr]:border-border",

        // Blockquotes
        "[&>blockquote]:border-l-4 [&>blockquote]:border-primary/50",
        "[&>blockquote]:pl-4 [&>blockquote]:py-1",
        "[&>blockquote]:text-muted-foreground",

        // Emoji alignment
        "[&_p]:flex [&_p]:items-center [&_p]:gap-2",

        // Strong and emphasis
        "[&>strong]:font-semibold [&>strong]:text-foreground",
        "[&>em]:italic",

        // Links
        "[&>a]:text-primary [&>a]:underline-offset-4 [&>a]:hover:underline",

        // Code blocks
        "[&>code]:bg-muted [&>code]:rounded [&>code]:px-1.5 [&>code]:py-0.5",
        "[&>pre]:bg-muted [&>pre]:p-4 [&>pre]:rounded-lg",

        // Tables
        "[&>table]:w-full [&>table]:border-collapse",
        "[&>table>*>tr]:border-b [&>table>*>tr]:border-border",
        "[&>table>*>tr>*]:px-3 [&>table>*>tr>*]:py-2",

        // Dark mode compatibility
        "dark:[&>blockquote]:border-primary/30",
        "dark:[&>hr]:border-border/50"
      )}
    >
      {content}
    </ReactMarkdown>
  )
}