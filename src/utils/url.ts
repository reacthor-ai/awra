export function constructCBOUrl(billDetails: any, billNumber: string): string | null {
  // Check if CBO estimates exist
  if (!('cboCostEstimates' in billDetails.bill) ||
    !billDetails.bill.cboCostEstimates.length) {
    return null;
  }

  const latestEstimate = billDetails.bill.cboCostEstimates[billDetails.bill.cboCostEstimates.length - 1];

  const date = new Date(latestEstimate.pubDate);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Adjust for 0-based index and ensure two digits
  return `https://www.cbo.gov/system/files/${year}-${month}/hr${billNumber}.pdf`;
}

export const exampleMessages = {
  "messages": [
    {
      "id": "4JTZCBAV9pzMcW48",
      "createdAt": "2024-12-29T00:43:30.975Z",
      "role": "user",
      "content": "im scared is this bill going to cost me a lot?"
    },
    {
      "id": "MDPIU62JLXsNyywS",
      "role": "assistant",
      "content": "Well howdy there, my fellow American! *adjusts star-spangled hat*\n\nLet me put your mind at ease about this bill's impact on your wallet. As your Uncle Sam, I can tell you with confidence that this bill won't put a dent in your personal finances!\n\nHere's the straight-shooting truth:\n- The total cost is less than $500,000 spread over FIVE YEARS for the entire federal government\n- That's about $100,000 per year - or less than a penny per American citizen annually\n- The money comes from existing judicial branch funding, not new taxes\n\nTo put it in perspective, my friend, if you bought a cup of coffee today, you've already spent more than what this bill would cost you personally in a decade! \n\nThis bill simply allows folks in Moab and Monticello, Utah to access federal courts closer to home - a fundamental right of every American that actually saves local citizens money on travel costs.\n\nSo rest easy, patriot! This is one of those rare government improvements that delivers more justice with minimal cost to taxpayers. Now that's what I call American efficiency! 🇺🇸\n\n*straightens bow tie proudly*",
      "createdAt": "2024-12-29T00:43:55.784Z",
      "revisionId": "dcvH2bRLBGMW69km"
    },
    {
      "id": "mrRO28kW6ElNKwbp",
      "createdAt": "2024-12-29T00:44:52.901Z",
      "role": "user",
      "content": "are you sure?"
    },
    {
      "id": "mUotJ8NYzwg0VMAk",
      "role": "assistant",
      "content": "*Adjusts star-spangled bow tie*\n\nMy fellow American,\n\nAs Uncle Sam, I stand firmly behind these numbers from our trusted Congressional Budget Office! Let me be as clear as the Liberty Bell:\n\nYes, I am absolutely sure about these cost figures. The CBO's estimate shows this courthouse expansion will cost less than $500,000 over five years (2025-2029) - that's about as much as running a small post office for a few months! \n\nThe beauty of this bill, my friend, is its fiscal responsibility:\n- Zero impact on direct spending\n- Zero effect on revenues\n- Zero increase to our national deficit\n\nJust like Benjamin Franklin taught us to be penny-wise, this bill is a prudent investment in justice. For less than half a million dollars, we're bringing federal courts closer to our citizens in eastern Utah - that's American efficiency at its finest!\n\nThe numbers come straight from the Administrative Office of U.S. Courts, and the CBO - two of our nation's most reliable sources for government cost estimates.\n\nThat's the honest truth, as honest as George Washington himself!\n\n🇺🇸 Your trusted Uncle Sam",
      "createdAt": "2024-12-29T00:45:10.621Z",
      "revisionId": "zEe7YW6kNtGxQRD6"
    },
    {
      "id": "n7GehBNvWspujV1s",
      "createdAt": "2024-12-29T00:45:50.599Z",
      "role": "user",
      "content": "well thank you, what is this bill about then?"
    },
    {
      "id": "FObG2s54NnBfXKDs",
      "role": "assistant",
      "content": "*Adjusts star-spangled bow tie*\n\nWell, my fellow American, let me tell you about this straightforward piece of legislation that's all about bringing justice closer to home for our citizens in Utah!\n\nThis bill is adding two new locations - Moab and Monticello - where federal courts can operate in Utah's Central Division. Right now, folks in these areas have to travel quite a distance to St. George for their day in federal court. As Americans, we believe justice should be accessible to all, and that's exactly what this bill aims to do!\n\nThe beauty of it? It's as American as apple pie in its efficiency:\n- It's budget-friendly (less than $500,000 over five years)\n- It creates no new taxes\n- It adds no burden to our national deficit\n\nThink of it this way: If you lived in Moab and needed to attend federal court, wouldn't you rather drive to your local courthouse than make a long journey to St. George? That's what we're fixing here - making our justice system work better for everyday Americans.\n\n*Straightens top hat proudly*\n\nIt's a simple change that makes a real difference in people's lives - and that's what good government is all about!\n\nWould you like to know more about any specific aspect of this bill, my fellow citizen?",
      "createdAt": "2024-12-29T00:46:08.140Z",
      "revisionId": "407js1LlN9xDJy8e"
    },
    {
      "id": "yomLp2tKsYHJzkfN",
      "createdAt": "2024-12-29T00:46:57.234Z",
      "role": "user",
      "content": "thank you"
    },
    {
      "id": "CKEJAcUumCUnxXO1",
      "role": "assistant",
      "content": "*Adjusts star-spangled bow tie*\n\nYou're most welcome, my fellow American! It warms my heart to help citizens understand how their government works. This particular bill is a fine example of making justice more accessible to everyday Americans in Utah, and at a mighty reasonable cost too - less than $500,000 over five years, which is just a drop in the bucket for bringing federal courts closer to the people.\n\nIf you ever have more questions about bills or their impact on our great nation, don't hesitate to ask. After all, an informed citizenry is the bedrock of our democracy!\n\n*Tips hat proudly*\n\nGod bless America! 🇺🇸",
      "createdAt": "2024-12-29T00:47:13.914Z",
      "revisionId": "iZDYXieaXGgLn4OH"
    }
  ]
}