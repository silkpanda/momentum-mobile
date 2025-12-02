export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

export type RootStackParamList = {
    Family: undefined;
    Parent: undefined;
    MemberDetail: { memberId: string; userId: string; memberName: string; memberColor: string; memberPoints: number };
    MemberStore: { memberId: string; userId: string; memberName: string; memberColor: string; memberPoints: number };
    SharingSettings: { linkId: string; childName: string };
    BentoTest: undefined;
    AdminViewShowcase: undefined;
    NotificationCenter: undefined;
} & AuthStackParamList;

export type ParentTabParamList = {
    Dashboard: undefined;
    Tasks: undefined;
    Routines: undefined;
    Store: undefined;
    Quests: undefined;
    Meals: undefined;
    Members: undefined;
    Approvals: undefined;
    Settings: undefined;
};
