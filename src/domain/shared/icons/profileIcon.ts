import { ComponentType } from 'react'
import { ProfileType } from '../../../core/apollo/generated/graphql-schema'
import { SvgIconProps } from '@mui/material'
import { CalendarIcon } from '../../timeline/calendar/icons/CalendarIcon'
import { ChallengeIcon } from '../../journey/challenge/icon/ChallengeIcon'
import { FileOpen } from '@mui/icons-material'

export const profileIcon = (profileType: ProfileType): ComponentType<SvgIconProps> => {
  switch (profileType) {
    case ProfileType.CalendarEvent: return CalendarIcon;
    case ProfileType.CalloutTemplate: return FileOpen;
    case ProfileType.Challenge: return ChallengeIcon;

    case ProfileType.CalloutFraming: return ChallengeIcon;

    default: return ChallengeIcon;
  }
}