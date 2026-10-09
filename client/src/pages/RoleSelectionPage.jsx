import { useNavigate } from "react-router";

// TODO(role-selection task): final design of this page.
const roles = [
  {
    path: "/customer",
    label: "Customer",
    description: "Choose a service and get a ticket",
  },
  {
    path: "/officer",
    label: "Officer",
    description: "Pick your counter and call the next customer",
  },
  {
    path: "/display",
    label: "Display board",
    description: "Show called tickets and queue lengths",
  },
];

export default function RoleSelectionPage() {
  const navigate = useNavigate();

  return (
    <section className="role-selection">
      <h1>Office Queue Management</h1>
      <div className="role-buttons">
        {roles.map((role) => (
          <button
            key={role.path}
            type="button"
            className="role-button"
            onClick={() => navigate(role.path)}
          >
            <span className="role-label">{role.label}</span>
            <span className="role-description">{role.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
