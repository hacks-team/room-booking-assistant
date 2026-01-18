import { Tv, Presentation, Video, Volume2, Building2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { InputField } from "@/components/input-field";
import { SubCard, SubCardContent, SubCardHeader } from "@/components/ui/sub-card";
import { SelectField } from "@/components/select-field";
import { DateField } from "@/components/date-field";
import { RoomSelect } from "./room-select";

export function BookingTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>예약 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <DateField label="날짜 선택" />
          <SubCard>
            <SubCardHeader>회의실 1</SubCardHeader>
            <SubCardContent>
              <Badge variant="outline">10:00 - 11:00</Badge>
              <Badge variant="outline">10:00 - 11:00</Badge>
            </SubCardContent>
          </SubCard>
          <SubCard>
            <SubCardHeader>회의실 2</SubCardHeader>
            <SubCardContent>
              <p className="text-muted-foreground text-sm">예약 없음</p>
            </SubCardContent>
          </SubCard>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>예약 조건</CardTitle>
        </CardHeader>
        <CardContent>
          <DateField label="날짜" />
          <InputField label="참석 인원" placeholder="1" type="number" min={1} />
          <SelectField label="시작 시간" options={[]} />
          <SelectField label="종료 시간" options={[]} />
          <SelectField
            label="선호 층 (선택)"
            options={[
              { label: "전체", value: "all" },
              { label: "회의실 A", value: "room-1" },
              { label: "회의실 B", value: "room-2" },
              { label: "대회의실", value: "room-3" },
              { label: "소회의실", value: "room-4" },
            ]}
          />

          <div className="space-y-2">
            <Label>필요 장비</Label>
            <ToggleGroup type="multiple" variant="outline" spacing={2} size="sm">
              <ToggleGroupItem value="tv">
                <Tv className="h-4 w-4" />
                TV
              </ToggleGroupItem>
              <ToggleGroupItem value="whiteboard">
                <Presentation className="h-4 w-4" />
                화이트보드
              </ToggleGroupItem>
              <ToggleGroupItem value="video">
                <Video className="h-4 w-4" />
                화상회의
              </ToggleGroupItem>
              <ToggleGroupItem value="speaker">
                <Volume2 className="h-4 w-4" />
                스피커
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>예약 가능한 회의실</CardTitle>
        </CardHeader>
        <CardContent>
          <RoomSelect selected name="회의실 1" floor={1} capacity={4} equipments={["tv", "whiteboard"]} />
          <RoomSelect name="회의실 2" floor={1} capacity={4} equipments={["tv", "whiteboard"]} />
          <Button size="lg">예약하기</Button>
        </CardContent>
      </Card>
    </div>
  );
}
