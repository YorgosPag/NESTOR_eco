import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { AuditLog } from "@/types"

export function RecentActivity({ logs }: { logs: AuditLog[] }) {
  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Πρόσφατη Δραστηριότητα</CardTitle>
        <CardDescription>
          Οι τελευταίες 5 ενέργειες που έγιναν σε όλα τα έργα.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src={log.user.avatar} alt="Avatar" />
                <AvatarFallback>{log.user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{log.action}</p>
                <p className="text-sm text-muted-foreground">
                  {log.details || `από ${log.user.name}`}
                </p>
              </div>
              <div className="ml-auto font-medium text-sm text-muted-foreground">
                {new Date(log.timestamp).toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
