import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { InlineFeedback } from "./inline-feedback";

describe("InlineFeedback", () => {
  it("renders error feedback with alert semantics", () => {
    const html = renderToStaticMarkup(
      <InlineFeedback tone="danger" message="Erro ao salvar" />,
    );

    expect(html).toContain('role="alert"');
    expect(html).toContain("Erro ao salvar");
    expect(html).toContain("border-destructive/30");
  });

  it("renders success feedback with status semantics", () => {
    const html = renderToStaticMarkup(
      <InlineFeedback tone="success" message="Sucesso" />,
    );

    expect(html).toContain('role="status"');
    expect(html).toContain("Sucesso");
    expect(html).toContain("border-success/30");
  });
});
