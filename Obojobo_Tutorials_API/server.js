const express = require('express');
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

// This is just for demonstration issues. We can easily hook a db here, such as:
// * mongoDB (w/ mongoose).
// * firebase
// * sqlite (or any sql)
const db = [
	{
		action_id: 'what-are-pages',
		tutorial_link: 'https://www.youtube.com/watch?v=96cydVB4w-A',
		gif_link: 'gif1.gif'
	},
	{
		action_id: 'how-rubrics-work',
		tutorial_link: 'link2',
		gif_link: 'https://www.youtube.com/watch?v=LnJwH_PZXnM'
	},
	{
		action_id: 'how-buttons-work',
		tutorial_link: 'link3',
		gif_link: 'gif_link3'
	},
	{
		action_id: 'assessment-creation',
		tutorial_link: 'link4',
		gif_link: 'gif_link4'
	},
];

// Cors setup to allow Obo query this API.
app.use(cors({
	origin: 'https://127.0.0.1:8080', // <- Location where obo is.
	credentials: true
}));

// action-id: a unique action id that represents a tutorial video and gif, such
// as "assessment-creation" or "rubrics".
app.get('/api/query/:action_id', (request, response) => {
	const action = db.find(obj => obj.action_id === request.params.action_id)
	return response.send(action)
});

// app.get('/test', (request, response) => {
// 	console.log('test-request arrived at the server!')
// 	return response.send('server says hey')
// });

app.listen(PORT, () => {
	console.log(`The server is listening on port ${PORT}`);
});
