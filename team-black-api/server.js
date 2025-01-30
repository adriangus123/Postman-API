const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const getTeamMembers = () => {
    const data = fs.readFileSync(path.join(__dirname, 'teamMembers.json'));
    return JSON.parse(data);
};

const saveTeamMembers = (members) => {
    fs.writeFileSync(path.join(__dirname, 'teamMembers.json'), JSON.stringify(members, null, 2));
};

// API endpoints
app.get('/team-black-api', (req, res) => {
    const teamMembers = getTeamMembers();
    res.json(teamMembers);
});

app.get('/team-black-api/:id', (req, res) => {
    const teamMembers = getTeamMembers();
    const member = teamMembers.find(m => m.id == req.params.id);
    if (!member) return res.status(404).send('Team Member Not Found');
    res.json(member);
});

app.post('/team-black-api', (req, res) => {
    const teamMembers = getTeamMembers();
    const newMembers = Array.isArray(req.body) ? req.body : [req.body];
    const addedMembers = [];
    const duplicateMembers = [];
    const errors = [];

    newMembers.forEach(member => {
        if (!member.name || !member.role) {
            errors.push({ member, message: 'Name and role are required for each team member' });
            return;
        }

        const duplicate = teamMembers.find(existingMember => existingMember.name === member.name && existingMember.role === member.role);

        if (duplicate) {
            duplicateMembers.push(member);
        } else {
            const newMember = {
                id: teamMembers.length + 1,
                name: member.name,
                role: member.role
            };
            teamMembers.push(newMember);
            addedMembers.push(newMember);
        }
    });

    saveTeamMembers(teamMembers);

    if (errors.length > 0) {
        return res.status(400).json({ message: 'Errors occurred with the following members', errors });
    }

    if (duplicateMembers.length > 0) {
        return res.status(400).json({ message: 'Member Already Exist', duplicates: duplicateMembers });
    }

    res.status(201).json(addedMembers);
});


app.put('/team-black-api/:id', (req, res) => {
    const teamMembers = getTeamMembers();
    const memberIndex = teamMembers.findIndex(m => m.id == req.params.id);
    if (memberIndex === -1) return res.status(404).send('Team Member Not Found');

    const previousMember = { ...teamMembers[memberIndex] };

    teamMembers[memberIndex].name = req.body.name;
    teamMembers[memberIndex].role = req.body.role;

    const updatedMember = { ...teamMembers[memberIndex] };

    saveTeamMembers(teamMembers);
    res.json({
        message: 'Team member updated',
        previousMember: previousMember,
        updatedMember: updatedMember
    });
});


app.delete('/team-black-api/:id', (req, res) => {
    let teamMembers = getTeamMembers();
    const memberIndex = teamMembers.findIndex(m => m.id == req.params.id);
    if (memberIndex === -1) return res.status(404).send('Team Member Not Found');

    // Preview deleted array
    const deletedMember = teamMembers[memberIndex];
    const updatedTeamMembers = teamMembers.slice();
    updatedTeamMembers.splice(memberIndex, 1);

    // Reassign IDs
    updatedTeamMembers.forEach((member, index) => {
        member.id = index + 1;
    });

    saveTeamMembers(updatedTeamMembers);
    res.status(200).json({
        message: 'Team member deleted',
        deletedMember: deletedMember
    });
});


// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
