document.addEventListener('DOMContentLoaded', () => {
    fetch('/team-black-api')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Data fetched:', data); // Debugging log
            displayTeamMembers(data);

            // Hide "Not found" message initially
            const noResults = document.getElementById('noResults');
            noResults.style.display = 'none';

            // Ensure the search bar is empty
            const filterInput = document.getElementById('filterInput');
            filterInput.value = '';
        })
        .catch(error => {
            console.error('Fetch error:', error); // Debugging log
        });

    const filterInput = document.getElementById('filterInput');
    const filterDropdown = document.getElementById('filterDropdown');
    
    // Update placeholder based on selected filter type
    filterDropdown.addEventListener('change', () => {
        const filterType = filterDropdown.value;
        switch (filterType) {
            case 'id':
                filterInput.placeholder = 'Search ID';
                break;
            case 'name':
                filterInput.placeholder = 'Search Name';
                break;
            case 'role':
                filterInput.placeholder = 'Search Role';
                break;
            default:
                filterInput.placeholder = 'Search';
                break;
        }
    });

    filterInput.addEventListener('input', filterTeamMembers);
    filterDropdown.addEventListener('change', filterTeamMembers);
});

function displayTeamMembers(members) {
    const teamList = document.getElementById('teamList');
    teamList.innerHTML = '';

    members.forEach(member => {
        const row = document.createElement('tr');
        const idCell = document.createElement('td');
        const nameCell = document.createElement('td');
        const roleCell = document.createElement('td');

        idCell.textContent = member.id;
        nameCell.textContent = member.name;
        roleCell.textContent = member.role;

        row.appendChild(idCell);
        row.appendChild(nameCell);
        row.appendChild(roleCell);
        teamList.appendChild(row);
        console.log('Added team member to table:', row); // Debugging log
    });
}

// Filter Function
function filterTeamMembers() {
    const filterValue = document.getElementById('filterInput').value.toLowerCase();
    const filterType = document.getElementById('filterDropdown').value;
    const rows = document.getElementById('teamList').getElementsByTagName('tr');
    const noResults = document.getElementById('noResults');
    const teamTable = document.getElementById('teamTable');
    let hasResults = false;

    Array.from(rows).forEach(row => {
        const id = row.cells[0].textContent.toLowerCase();
        const name = row.cells[1].textContent.toLowerCase();
        const role = row.cells[2].textContent.toLowerCase();
        let match = false;

        if (filterType === 'all') {
            match = id.includes(filterValue) || name.includes(filterValue) || role.includes(filterValue);
        } else if (filterType === 'id') {
            match = id.includes(filterValue);
        } else if (filterType === 'name') {
            match = name.includes(filterValue);
        } else if (filterType === 'role') {
            match = role.includes(filterValue);
        }

        row.style.display = match ? '' : 'none';
        if (match) hasResults = true;
        console.log('Filtering team members:', filterValue, filterType, match); // Debugging log
    });

    // RESULT
    if (hasResults) {
        noResults.style.display = 'none';
        teamTable.style.display = '';
    } else {
        noResults.style.display = 'block';
        teamTable.style.display = 'none';
    }
}
