import ChartBarIcon from "@heroicons/react/24/solid/ChartBarIcon";
import CogIcon from "@heroicons/react/24/solid/CogIcon";
import LockClosedIcon from "@heroicons/react/24/solid/LockClosedIcon";
import ShoppingBagIcon from "@heroicons/react/24/solid/ShoppingBagIcon";
import UserIcon from "@heroicons/react/24/solid/UserIcon";
import UserPlusIcon from "@heroicons/react/24/solid/UserPlusIcon";
import UsersIcon from "@heroicons/react/24/solid/UsersIcon";
import XCircleIcon from "@heroicons/react/24/solid/XCircleIcon";
import PlayCircleFilledTwoToneIcon from "@mui/icons-material/PlayCircleFilledTwoTone";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import { SvgIcon } from "@mui/material";
import DirectionsRunRoundedIcon from "@mui/icons-material/DirectionsRunRounded";

export const items = [
  {
    title: "Dashboard",
    path: "/",
    icon: (
      <SvgIcon fontSize="small">
        <PlayCircleFilledTwoToneIcon />
      </SvgIcon>
    ),
  },
  {
    title: "Trial Run",
    path: "/trial-run",
    icon: (
      <SvgIcon fontSize="small">
        <DirectionsRunRoundedIcon />
      </SvgIcon>
    ),
  },
  {
    title: "I/O",
    path: "/io",
    icon: (
      <SvgIcon fontSize="small">
        <TuneRoundedIcon />
      </SvgIcon>
    ),
  },
  {
    title: "Error Logs",
    path: "/error-log",
    icon: (
      <SvgIcon fontSize="small">
        <EventNoteRoundedIcon />
      </SvgIcon>
    ),
  },
  {
    title: "Settings",
    path: "/settings",
    icon: (
      <SvgIcon fontSize="small">
        <BuildRoundedIcon />
      </SvgIcon>
    ),
  },
  // {
  //   title: 'Overview',
  //   path: '/',
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <ChartBarIcon />
  //     </SvgIcon>
  //   )
  // },
  // {
  //   title: 'Customers',
  //   path: '/customers',
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <UsersIcon />
  //     </SvgIcon>
  //   )
  // },
  // {
  //   title: 'Companies',
  //   path: '/companies',
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <ShoppingBagIcon />
  //     </SvgIcon>
  //   )
  // },
  // {
  //   title: 'Account',
  //   path: '/account',
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <UserIcon />
  //     </SvgIcon>
  //   )
  // },
  // {
  //   title: 'Settings',
  //   path: '/settings',
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <CogIcon />
  //     </SvgIcon>
  //   )
  // },
  // {
  //   title: 'Login',
  //   path: '/auth/login',
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <LockClosedIcon />
  //     </SvgIcon>
  //   )
  // },
  // {
  //   title: 'Register',
  //   path: '/auth/register',
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <UserPlusIcon />
  //     </SvgIcon>
  //   )
  // },
  // {
  //   title: 'Error',
  //   path: '/404',
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <XCircleIcon />
  //     </SvgIcon>
  //   )
  // }
];
