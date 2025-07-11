
"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AuditLog } from "@/types";
import { Badge } from "@/components/ui/badge";

interface AuditLogDisplayProps {
  auditLogs: AuditLog[];
}

export function AuditLogDisplay({ auditLogs }: AuditLogDisplayProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (auditLogs.length === 0) {
    return (
      <p className="text-muted-foreground text-center">
        Δεν υπάρχει ακόμη ιστορικό ενεργειών για αυτό το έργο.
      </p>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Χρήστης</TableHead>
          <TableHead>Ενέργεια</TableHead>
          <TableHead>Λεπτομέρειες</TableHead>
          <TableHead className="text-right">Ημερομηνία</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {auditLogs.map((log) => (
          <TableRow key={log.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={log.user.avatar} alt={log.user.name} />
                  <AvatarFallback>{log.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="font-medium">{log.user.name}</div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{log.action}</Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {log.details || "Δ/Υ"}
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {isClient
                ? new Date(log.timestamp).toLocaleString("el-GR")
                : "..."}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
