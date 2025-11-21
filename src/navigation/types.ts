export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

export type RootStackParamList = {
    Family: undefined;
    Parent: undefined;
    MemberDetail: { memberId: string; memberName: string; memberColor: string; memberPoints: number };
} & AuthStackParamList;

export type ParentTabParamList = {
    Tasks: undefined;
    Store: undefined;
    Quests: undefined;
    Meals: undefined;
    Settings: undefined;
};
