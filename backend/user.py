from typing import Dict

import db_utils.user


class User(object):
    def __init__(self, user_id: str, athlete_id: str):
        self.user_id = user_id
        self.athlete_id = athlete_id

    def __str__(self) -> str:
        return f'user_id: {self.user_id}, athlete_id: {self.athlete_id}'

    def to_dict(self) -> Dict:
        return {
            'user_id': self.user_id,
            'athlete_id': self.athlete_id,
        }

    @classmethod
    async def get(cls, user_id: str) -> 'User':
        user_dict = await (
            db_utils.user.get_user(user_id=user_id)
        )

        return User(user_id=user_dict['user_id'],
                    athlete_id=user_dict['athlete_id'])

    @classmethod
    async def register(self, user_id: str, athlete_id: str):
        if not user_id:
            raise ValueError("Missing user_id!")
        if athlete_id is None:
            raise ValueError("Missing athlete_id!")

        user = User(user_id=user_id, athlete_id=athlete_id)
        print(f"storing user: {str(user)}")
        await db_utils.user.put_user(user)
        return user


async def retrieve_user(request, payload, *args, **kwargs):
    if payload:
        user_id = payload.get('user_id', None)
        try:
            user = await User.get(user_id=user_id)
            return user
        except Exception as e:
            print(f"Error trying to retrieve user: {user_id}")
            print(f"Exception: {e}")
            return None
    else:
        return None
