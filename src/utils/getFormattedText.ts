type TextVersion = {
  formats: Array<{ type: string; url: string }>;
};

type BillByText = {
  textVersions: TextVersion[];
};

type Format = { type: string; url: string } | null;

export function getFormattedText(billByText: BillByText): Format {
  if (!billByText.textVersions.length) {
    return null;
  }

  const textVersion = billByText.textVersions[0];
  return textVersion.formats.find((format) => format.type === 'Formatted Text') || null;
}
