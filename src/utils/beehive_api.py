import aiohttp
import jwt
import os
from datetime import datetime
from PIL import Image
import aiofiles

class BeehiveAPI:
    def __init__(self, token=None, user_id=None):
        self.token = token
        self.user_id = user_id
    
    async def login(self, username, password, attempts=0):
        url = "https://beehiveapi.lionhearttrust.org.uk/token"
        payload = {
            'grant_type': 'password',
            'username': username,
            'password': password,
            'client_id': 'web'
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, data=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    self.token = data['access_token']
                    decoded = jwt.decode(self.token, options={"verify_signature": False})
                    self.user_id = decoded['id']
                    return True
                else:
                    if attempts < 4:
                        return await self.login(username, password, attempts + 1)
                    else:
                        return False
    
    async def submit_assignment(self, assignment_id, attempts=0):
        if not self.token or not self.user_id:
            return False
            
        url = f'https://beehiveapi.lionhearttrust.org.uk/v3.5/planner/students/{self.user_id}/assignments/{assignment_id}/submit'
        headers = {
            'Authorization': f'Bearer {self.token}'
        }
        data = {
            "difficulty": None,
            "timescale": None,
            "comments": None,
            "requireAssistance": None,
            "understoodRequirements": None,
            "studentId": self.user_id,
            "assignmentId": assignment_id
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=data) as response:
                if response.status == 200:
                    return True
                else:
                    if attempts < 4:
                        return await self.submit_assignment(assignment_id, attempts + 1)
                    else:
                        return False
    
    async def get_smartcard_info(self, attempts=0):
        if not self.token or not self.user_id:
            return 0, 0, {}
            
        url = f"https://beehiveapi.lionhearttrust.org.uk/v3.5/payments/users/{self.user_id}/smartcards/all"
        url2 = f'https://beehiveapi.lionhearttrust.org.uk/v3.5/payments/users/{self.user_id}/smartcards/transactions?pageIndex=0&pageSize=1000'
        headers = {
            "Authorization": f"Bearer {self.token}"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    async with session.get(url2, headers=headers) as response2:
                        transactions = []
                        if response2.status == 200:
                            data2 = await response2.json()
                            for i in data2['items']:
                                transactions.append({
                                    'total': i['total'],
                                    'description': i['description'],
                                    'date': i['date']
                                })
                        
                        balance = data[0]['balance']
                        printbalance = data[0]['printCreditBalance']['purses'][1]['balance']
                        return balance, printbalance, transactions
                else:
                    if attempts < 4:
                        return await self.get_smartcard_info(attempts + 1)
                    else:
                        return 0, 0, {}
    
    async def get_user_stats(self, attempts=0):
        if not self.token or not self.user_id:
            return 'unknown', 'unknown', 0, 0, 0, 0, 0
            
        url = f"https://beehiveapi.lionhearttrust.org.uk/v3.5/planner/students/{self.user_id}"
        headers = {
            "Authorization": f"Bearer {self.token}"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    tutor_group = data['tutorGroup']['name']
                    name = f"{data['firstName']} {data['lastName']}"
                    attendance = data['pastoral']['attendance']
                    behaviour_points = data['pastoral']['behaviourPoints']
                    reward_points = data['pastoral']['rewardPoints']
                    lates = data['pastoral']['lates']
                    absences = data['pastoral']['absences']
                    
                    return name, tutor_group, attendance, behaviour_points, reward_points, lates, absences
                else:
                    if attempts < 4:
                        return await self.get_user_stats(attempts + 1)
                    else:
                        return 'unknown', 'unknown', 0, 0, 0, 0, 0
    
    async def get_events(self, attempts=0):
        if not self.token or not self.user_id:
            return {}
            
        url = f"https://beehiveapi.lionhearttrust.org.uk/v3.5/planner/calendar/users/{self.user_id}/events"
        headers = {
            "Authorization": f"Bearer {self.token}"
        }
        now = datetime.now()
        formatted_date = now.strftime("%Y-%m-%d")
        params = {
            "pageIndex": 0,
            "startDate": formatted_date
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    formatted_data = {}
                    for item in data['items']:
                        formatted_data[str(item['id'])] = {
                            'title': item['title'],
                            'allowsignupfrom': item['allowSignupFrom'],
                            'allowsighnupto': item.get('allowSignupTo', 'N/A'),
                            'sighnedup': item['signedUp']
                        }
                    return formatted_data
                else:
                    if attempts < 4:
                        return await self.get_events(attempts + 1)
                    else:
                        return {}
    
    async def get_timetable(self, attempts=0):
        if not self.token or not self.user_id:
            return {}
            
        url = f"https://beehiveapi.lionhearttrust.org.uk/v3.5/planner/users/{self.user_id}/timetable"
        headers = {
            "Authorization": f"Bearer {self.token}"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    parsed_data = {}
                    for school in data['schools']:
                        for cycle in school['cycles']:
                            for day in cycle['days']:
                                day_name = day['day']
                                parsed_data[day_name] = {}
                                lunch = False
                                offset = 1
                                for idx, lesson in enumerate(day['lessons']):
                                    end_time = lesson['ends']
                                    start_time = lesson['starts']
                                    if lesson['teacher'].strip():
                                        subject = lesson['subject']
                                    else:
                                        if idx == 5:
                                            subject = 'Lunch'
                                            lunch = True
                                        elif idx == 6 and lunch == False:
                                            subject = 'Lunch'
                                            end_time = '14:00:00'
                                            start_time = '13:20:00'
                                            lunch = True
                                        else:
                                            subject = 'Free'
                                    
                                    if idx == 5 and lunch == False:
                                        end_time = '13:20:00'
                                    if idx == 3:
                                        parsed_data[day_name][str(idx + offset)] = {
                                            'subject': 'break',
                                            'teacher': '',
                                            'room': '',
                                            'times': f"10:30:00 to 10:50:00"
                                        }
                                        offset = 2
                                    teacher = lesson['teacher'].strip() if lesson['teacher'].strip() else ''
                                    try:
                                        room = lesson['room'].strip() if lesson['room'].strip() else ''
                                    except:
                                        room = ''
                                    parsed_data[day_name][str(idx + offset)] = {
                                        'subject': subject,
                                        'teacher': teacher,
                                        'room': room,
                                        'times': f"{start_time} to {end_time}"
                                    }
                    return parsed_data
                else:
                    if attempts < 4:
                        return await self.get_timetable(attempts + 1)
                    else:
                        return {}
    
    async def get_assignments(self, attempts=0):
        if not self.token or not self.user_id:
            return {}
            
        url = f"https://beehiveapi.lionhearttrust.org.uk/v3.5/planner/students/{self.user_id}/assignmentstiny"
        params = {
            "filter": "0",
            "pageSize": "1000",
            "pageIndex": "0"
        }
        headers = {
            "Authorization": f"Bearer {self.token}"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    formatted_data = {}
                    
                    for item in data['items']:
                        assignment_url = f"https://beehiveapi.lionhearttrust.org.uk/v3.5/planner/users/{self.user_id}/assignments/{item['id']}"
                        
                        async with session.get(assignment_url, headers=headers) as assignment_response:
                            if assignment_response.status == 200:
                                assignment_data = await assignment_response.json()
                                files = {}
                                links = []
                                
                                for i in assignment_data['files']:
                                    files[str(i['id'])] = i['filename']
                                for i in assignment_data['links']:
                                    links.append(i['url'])
                                    
                                formatted_data[str(item['id'])] = {
                                    "title": assignment_data['title'],
                                    "deadline": assignment_data['deadline'],
                                    "set_by": f"{assignment_data['setBy']['title']} {assignment_data['setBy']['firstName']} {assignment_data['setBy']['lastName']}",
                                    "completed": assignment_data['isComplete'],
                                    "overdue": assignment_data['isOverdue'],
                                    "description": assignment_data['details'],
                                    "links": links,
                                    "files": files
                                }
                    
                    return formatted_data
                else:
                    if attempts < 4:
                        return await self.get_assignments(attempts + 1)
                    else:
                        return {}
    
    async def get_links(self, attempts=0):
        if not self.token:
            return {}
            
        url = "https://beehiveapi.lionhearttrust.org.uk/v3.5/planner/links"
        headers = {
            "Authorization": f"Bearer {self.token}"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    output_data = {}
                    for category in data:
                        for link in category['links']:
                            output_data[link['title']] = {
                                'desk': link['description'],
                                'url': link['url']
                            }
                    return output_data
                else:
                    if attempts < 4:
                        return await self.get_links(attempts + 1)
                    else:
                        return {}
    
    async def get_noticeboard(self, attempts=0):
        if not self.token or not self.user_id:
            return {}
            
        url = f"https://beehiveapi.lionhearttrust.org.uk/v3.5/feed/users/{self.user_id}?feedItemType=1&pageIndex=0&pageSize=20"
        headers = {
            "Authorization": f"Bearer {self.token}"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    parsed_data = []
                    
                    for i in data['items']:
                        images = []
                        for j in i['files']:
                            if j['extension'] in ['.png', '.jpeg', '.jpg']:
                                images.append(j['id'])
                                webp_path = f'static/fasthive/noticeboard/{j["id"]}.webp'
                                jpg_path = f'static/fasthive/noticeboard/{j["id"]}.jpg'
                                image_url = f'https://beehiveapi.lionhearttrust.org.uk/v3.5/files/images/{j["id"]}'

                                if not os.path.isfile(webp_path):
                                    async with aiohttp.ClientSession() as session:
                                        async with session.get(image_url) as response:
                                            if response.status == 200:
                                                async with aiofiles.open(jpg_path, mode='wb') as f:
                                                    await f.write(await response.read())
                                            else:
                                                raise Exception(f"Failed to download image: {response.status}")

                                    jpg_image = Image.open(jpg_path)
                                    jpg_image.save(webp_path, 'WEBP', quality=50)

                                    try:
                                        await aiofiles.os.remove(jpg_path)
                                    except FileNotFoundError:
                                        pass
                                                                
                        parsed_data.append({
                            'title': i['title'],
                            'content': i['content'],
                            'images': images,
                            'time': i['publishedDate']
                        })
                    
                    return parsed_data
                else:
                    if attempts < 4:
                        return await self.get_noticeboard(attempts + 1)
                    else:
                        return {}

    @classmethod
    async def from_credentials(cls, username, password, attempts=0):
        """Authenticate with username and password, and return token and user_id"""
        url = "https://beehiveapi.lionhearttrust.org.uk/token"
        payload = {
            'grant_type': 'password',
            'username': username,
            'password': password,
            'client_id': 'web'
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, data=payload) as response:
                    status = response.status
                    try:
                        response_text = await response.text()
                        print(f"Response status: {status}")
                        print(f"Response body: {response_text}")
                        
                        if status == 200:
                            try:
                                data = await response.json()
                                token = data.get('access_token')
                                if token:
                                    try:
                                        decoded = jwt.decode(token, options={"verify_signature": False})
                                        user_id = decoded.get('id')
                                        if user_id:
                                            return token, user_id
                                        else:
                                            print("User ID not found in token")
                                    except Exception as e:
                                        print(f"Error decoding token: {e}")
                                else:
                                    print("Token not found in response")
                            except Exception as e:
                                print(f"Error parsing JSON: {e}")
                        else:
                            print(f"Authentication failed with status {status}")
                            
                        if attempts < 4:
                            print(f"Retrying... (attempt {attempts + 1})")
                            return await cls.from_credentials(username, password, attempts + 1)
                        else:
                            print("Maximum retry attempts reached")
                            return None, None
                    except Exception as e:
                        print(f"Error reading response: {e}")
                        return None, None
        except Exception as e:
            print(f"Connection error: {e}")
            return None, None

        
    @classmethod
    def from_token(cls, token, user_id):
        """Create a BeehiveAPI instance from token and user_id"""
        return cls(token, user_id)