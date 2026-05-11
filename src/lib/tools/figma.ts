import { z } from "zod";

/**
 * Figma MCP Tool - Connect to Figma via MCP server
 *
 * Supports:
 * - Reading design tokens from Figma files
 * - Creating/modifying frames and components
 * - Exporting assets
 * - Getting color styles, text styles, etc.
 */

const FigmaParameters = z.object({
  action: z.enum([
    "get_file",
    "get_styles",
    "get_components",
    "get_colors",
    "get_text_styles",
    "create_frame",
    "create_rectangle",
    "create_text",
    "create_component",
    "export_node",
  ]),
  file_key: z.string().describe("Figma file key (from URL: figma.com/file/FILE_KEY/...)"),
  node_id: z.string().optional().describe("Specific node ID to target"),
  name: z.string().optional().describe("Name for new element"),
  type: z.string().optional().describe("Element type: frame, rectangle, text, etc."),
  x: z.number().optional().describe("X position"),
  y: z.number().optional().describe("Y position"),
  width: z.number().optional().describe("Width"),
  height: z.number().optional().describe("Height"),
  fill: z.string().optional().describe("Fill color (hex format)"),
  text_content: z.string().optional().describe("Text content for text elements"),
  parent_node_id: z.string().optional().describe("Parent node ID for new elements"),
});

export const buildFigmaTool = () => {
  return {
    id: "figma" as const,
    description: "Interact with Figma designs - read design tokens, create/modify frames, export assets",
    parameters: FigmaParameters,
    execute: async (params: z.infer<typeof FigmaParameters>) => {
      const figmaToken = process.env.FIGMA_ACCESS_TOKEN;

      if (!figmaToken) {
        return {
          error: "FIGMA_ACCESS_TOKEN not set. Add your Figma Personal Access Token to .env file.",
          setup: "1. Go to https://www.figma.com/settings/personal-access-tokens\n2. Create a new token\n3. Add FIGMA_ACCESS_TOKEN=your_token to .env"
        };
      }

      const baseUrl = "https://api.figma.com/v1";
      const headers = {
        "X-Figma-Token": figmaToken,
        "Content-Type": "application/json",
      };

      try {
        switch (params.action) {
          case "get_file": {
            const response = await fetch(`${baseUrl}/files/${params.file_key}`, { headers });
            const data = await response.json();
            return { success: true, data };
          }

          case "get_styles": {
            const response = await fetch(`${baseUrl}/files/${params.file_key}/styles`, { headers });
            const data = await response.json();
            return { success: true, data };
          }

          case "get_components": {
            const response = await fetch(`${baseUrl}/files/${params.file_key}/components`, { headers });
            const data = await response.json();
            return { success: true, data };
          }

          case "get_colors": {
            // Get file and extract color styles
            const fileResponse = await fetch(`${baseUrl}/files/${params.file_key}`, { headers });
            const fileData = await fileResponse.json();

            const colors: Record<string, string> = {};
            const styles = fileData.meta?.styles || [];

            for (const style of styles) {
              if (style.styleType === "FILL" && style.name) {
                colors[style.name] = style.description || "No description";
              }
            }

            return { success: true, colors, allStyles: styles };
          }

          case "get_text_styles": {
            const fileResponse = await fetch(`${baseUrl}/files/${params.file_key}`, { headers });
            const fileData = await fileResponse.json();

            const textStyles: Record<string, object> = {};
            const styles = fileData.meta?.styles || [];

            for (const style of styles) {
              if (style.styleType === "TEXT" && style.name) {
                textStyles[style.name] = { description: style.description || "" };
              }
            }

            return { success: true, textStyles };
          }

          case "create_frame": {
            // Note: Write operations require additional permissions
            const response = await fetch(`${baseUrl}/files/${params.file_key}/nodes`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                name: params.name || "New Frame",
                type: "FRAME",
                x: params.x || 0,
                y: params.y || 0,
                width: params.width || 100,
                height: params.height || 100,
                parentId: params.parent_node_id,
              }),
            });
            const data = await response.json();
            return { success: true, data };
          }

          case "create_rectangle": {
            const response = await fetch(`${baseUrl}/files/${params.file_key}/nodes`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                name: params.name || "Rectangle",
                type: "RECTANGLE",
                x: params.x || 0,
                y: params.y || 0,
                width: params.width || 100,
                height: params.height || 100,
                fills: params.fill ? [{ type: "SOLID", color: hexToFigmaColor(params.fill) }] : [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }],
                parentId: params.parent_node_id,
              }),
            });
            const data = await response.json();
            return { success: true, data };
          }

          case "create_text": {
            const response = await fetch(`${baseUrl}/files/${params.file_key}/nodes`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                name: params.name || "Text",
                type: "TEXT",
                x: params.x || 0,
                y: params.y || 0,
                characters: params.text_content || "Hello",
                parentId: params.parent_node_id,
              }),
            });
            const data = await response.json();
            return { success: true, data };
          }

          case "create_component": {
            const response = await fetch(`${baseUrl}/files/${params.file_key}/components`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                name: params.name || "Component",
              }),
            });
            const data = await response.json();
            return { success: true, data };
          }

          case "export_node": {
            if (!params.node_id) {
              return { error: "node_id is required for export" };
            }
            const response = await fetch(
              `${baseUrl}/images/${params.file_key}?ids=${params.node_id}&format=png`,
              { headers }
            );
            const data = await response.json();
            return { success: true, imageUrl: data.images?.[params.node_id], data };
          }

          default:
            return { error: `Unknown action: ${params.action}` };
        }
      } catch (error: any) {
        return {
          error: error.message || "Failed to execute Figma action",
          details: error.toString(),
        };
      }
    },
  };
};

// Helper: Convert hex color to Figma RGB format (0-1 range)
function hexToFigmaColor(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };

  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  };
}
