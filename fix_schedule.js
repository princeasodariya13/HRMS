const fs = require("fs");
let content = fs.readFileSync("app/dashboard/admin/schedules/SchedulesClient.tsx", "utf-8");

content = content.replace('import { useState, useTransition } from "react";', 'import React, { useState, useTransition } from "react";\nimport { useRouter } from "next/navigation";');
content = content.replace('const [isPending, startTransition] = useTransition();', 'const [isPending, startTransition] = useTransition();\n  const router = useRouter();');
content = content.replace('const [schedules, setSchedules] = useState(initialSchedules);', 'const [schedules, setSchedules] = useState(initialSchedules);\n  React.useEffect(() => { setSchedules(initialSchedules); }, [initialSchedules]);');
content = content.replace('window.location.reload();', 'router.refresh();');
content = content.replace('<p>No schedules found.</p>', '<p>{searchQuery ? `No schedules found matching "${searchQuery}".` : "No working schedules configured."}</p>');

fs.writeFileSync("app/dashboard/admin/schedules/SchedulesClient.tsx", content);
console.log("Fixed SchedulesClient.tsx");